
#Soft Attention

import tensorflow as tf
from keras.layers import Layer

class SoftAttention(Layer):
    def __init__(self, ch, m, concat_with_x=False, aggregate=False, **kwargs):
        self.channels = int(ch)
        self.multiheads = m
        self.aggregate_channels = aggregate
        self.concat_input_with_scaled = concat_with_x
        super(SoftAttention, self).__init__(**kwargs)

    def build(self, input_shape):
        self.i_shape = input_shape
        kernel_shape_conv3d = (self.channels, 3, 3) + (1, self.multiheads)  # DHWC
        self.out_attention_maps_shape = input_shape[0:1] + (self.multiheads,) + input_shape[1:-1]

        if self.aggregate_channels == False:
            self.out_features_shape = input_shape[:-1] + (input_shape[-1] + (input_shape[-1] * self.multiheads),)
        else:
            if self.concat_input_with_scaled:
                self.out_features_shape = input_shape[:-1] + (input_shape[-1] * 2,)
            else:
                self.out_features_shape = input_shape

        self.kernel_conv3d = self.add_weight(shape=kernel_shape_conv3d,
                                             initializer='he_uniform',
                                             name='kernel_conv3d')
        self.bias_conv3d = self.add_weight(shape=(self.multiheads,),
                                           initializer='zeros',
                                           name='bias_conv3d')

        super(SoftAttention, self).build(input_shape)

    def call(self, x):
        exp_x = tf.expand_dims(x, axis=-1)  # Use tf.expand_dims here

        c3d = tf.nn.conv3d(exp_x, filters=self.kernel_conv3d, strides=[1, 1, 1, self.i_shape[-1], 1], padding='SAME')
        conv3d = tf.nn.bias_add(c3d, self.bias_conv3d)
        conv3d = tf.nn.relu(conv3d)
        conv3d = tf.transpose(conv3d, perm=[0, 4, 1, 2, 3])

        conv3d = tf.squeeze(conv3d, axis=-1)
        conv3d = tf.reshape(conv3d, shape=(-1, self.multiheads, self.i_shape[1] * self.i_shape[2]))

        softmax_alpha = tf.nn.softmax(conv3d, axis=-1)
        softmax_alpha = tf.reshape(softmax_alpha, shape=(-1, self.multiheads, self.i_shape[1], self.i_shape[2]))

        if self.aggregate_channels == False:
            exp_softmax_alpha = tf.expand_dims(softmax_alpha, axis=-1)
            exp_softmax_alpha = tf.transpose(exp_softmax_alpha, perm=[0, 2, 3, 1, 4])

            x_exp = tf.expand_dims(x, axis=-2)
            u = tf.multiply(exp_softmax_alpha, x_exp)
            u = tf.reshape(u, shape=(-1, self.i_shape[1], self.i_shape[2], u.shape[-1] * u.shape[-2]))
        else:
            exp_softmax_alpha = tf.transpose(softmax_alpha, perm=[0, 2, 3, 1])
            exp_softmax_alpha = tf.reduce_sum(exp_softmax_alpha, axis=-1)
            exp_softmax_alpha = tf.expand_dims(exp_softmax_alpha, axis=-1)
            u = tf.multiply(exp_softmax_alpha, x)

        if self.concat_input_with_scaled:
            o = tf.concat([u, x], axis=-1)
        else:
            o = u

        return [o, softmax_alpha]

    def compute_output_shape(self, input_shape):
        return [self.out_features_shape, self.out_attention_maps_shape]

    def get_config(self):
        config = super(SoftAttention, self).get_config()
        config.update({
            'channels': self.channels,
            'multiheads': self.multiheads,
            'aggregate_channels': self.aggregate_channels,
            'concat_input_with_scaled': self.concat_input_with_scaled,
        })
        return config
