import React, { useState } from 'react';
import axios from 'axios';
import '../src/style/style.css';

function Interface() {
  const [result, setResult] = useState('');
  const [message, setMessage] = useState(''); // Thêm state để lưu trữ thông báo trả về từ API
  const [image, setImage] = useState(null);

  const diseaseNames = [
    "Actinic Keratosis",
    "Basal Cell Carcinoma",
    "Benign Keratosis",
    "Dermatofibroma",
    "Melanoma",
    "Nevus",
    "Vascular Lesion"
  ];
  
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    setImage(URL.createObjectURL(file)); // Display the uploaded image
  
    try {
      const response = await axios.post('http://localhost:5000/process_image', formData);
      const predictedClass = response.data.message[0];
      const predictedProbability = response.data.message[1] * 100;

      setResult(predictedClass); // Assuming response.data.message contains the predicted_class
      if (!isNaN(predictedProbability)) {
        setMessage(`The predicted disease is ${diseaseNames[predictedClass]} with ${(predictedProbability).toFixed(2)}% probability.`);
      } else {
        setMessage(`The predicted disease is ${diseaseNames[predictedClass]}.`);
      }
    } catch (error) {
      console.error(error);
    }
  };
  

  return (
    <div className="container">
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Skin Legion Detection</title>
      <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap" rel="stylesheet" />
      <div className="header">
        <h2>Skin Lesion Detection</h2>
        <img className="header-image" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4bW-zOzOjbTwNXEvguVe1AawtNlG8Fqe1XJ7mmBKSsw&s" alt="Header" />
      </div>
      <div className="upload-file-image">
        <h4>Upload an Image</h4>
        <input type="file" onChange={handleImageUpload} />
      </div>
      <hr />
      <div className="prediction-div">
        {image && <img className="uploaded-image" src={image} alt="Uploaded" />}
        {result !== '' && (
          <h3 className="predicted-disease">
            The predicted disease is <span>{diseaseNames[result]}</span>.
          </h3>
        )}
        {message !== '' && <p className="prediction-message">{message}</p>} {/* Hiển thị thông báo trả về từ API */}
      </div>
    </div>
  );
}

export default Interface;
