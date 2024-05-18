import cv2
from flask import Flask, jsonify, request
from flask_cors import CORS
import numpy as np
import tensorflow as tf
from keras.preprocessing import image
from PIL import ImageFile
import base64
from segment_img import *

ImageFile.LOAD_TRUNCATED_IMAGES = True

# Soft Attention class and build_model function should be defined or imported here
from soft_attention import *
from build_model import *

# Assuming the model is already built and loaded
irv2 = tf.keras.applications.InceptionResNetV2(
    include_top=True,
    weights="imagenet",
    input_tensor=None,
    input_shape=None,
    pooling=None,
    classifier_activation="softmax",
)

# Excluding the last 28 layers of the model.
conv = irv2.layers[-28].output

# Add the soft attention layer here
attention_layer, map2 = SoftAttention(aggregate=True, m=16, concat_with_x=False, ch=int(conv.shape[-1]), name='soft_attention')(conv)
attention_layer = MaxPooling2D(pool_size=(2, 2), padding="same")(attention_layer)
conv = MaxPooling2D(pool_size=(2, 2), padding="same")(conv)

conv = concatenate([conv, attention_layer])
conv = Activation('relu')(conv)
conv = Dropout(0.5)(conv)

output = Flatten()(conv)
output = Dense(7, activation='softmax')(output)
model = Model(inputs=irv2.input, outputs=output)
model.summary()

model.load_weights(r"D:\WorkSpace_Thinh1\GUI_DataMining\IRV2+SA.hdf5")

app = Flask(__name__)
CORS(app)

def process_image(image_path):
    img = image.load_img(image_path, target_size=(299, 299))
    img_array = image.img_to_array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    
    predicted = model.predict(img_array)
    predicted_class = np.argmax(predicted, axis=1)
    predicted_probability = np.max(predicted, axis=1)
    
    segmented_image_base64 = segment_and_draw_clusters_base64(image_path)

    result = {
        'message': (int(predicted_class[0]),float(predicted_probability[0]),segmented_image_base64)
    }
    return result

@app.route('/process_image', methods=['POST'])
def process_image_route():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}),400

    image_file = request.files['image']
    image_file.save('uploaded_image.jpg')
    
    result = process_image('uploaded_image.jpg')
    
    return jsonify(result),201

if __name__ == '__main__':
    app.run()
