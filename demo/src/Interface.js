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

  const [diseaseResults, setDiseaseResults] = useState(Array(7).fill(null));

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    setImage(URL.createObjectURL(file)); // Display the uploaded image
  
    try {
      const response = await axios.post('http://localhost:5000/process_image', formData);
      setResult(response.data.message[0]); // Assuming response.data.message contains the predicted_class
      setMessage(`The predicted disease is ${diseaseNames[response.data.message[0]]} with ${(response.data.message[1] * 100).toFixed(2)}% probability.`);
    } catch (error) {
      console.error(error);
    }
  };
  

  return (
    <div className="container">
      <div className="content">
        <div className="header">
          <h2>Skin Lesion Detection</h2>
        </div>
        <div className="upload-file-image">
          <h4>Upload an Image</h4>
          <input type="file" onChange={handleImageUpload} />
        </div>
        <div className="prediction-result">
          <h3>Prediction</h3>
          {message && <p className="message">{message}</p>}
          <div className="disease-list">
            {diseaseNames.map((disease, index) => (
              <div key={index} className={`disease-item ${result === index ? 'predicted' : ''}`}>
                <div className="disease-name">{disease}</div>
                <div className="probability">{diseaseResults[index]}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="background-image">
        {image && <img src={image} alt="Uploaded" />}
      </div>
    </div>
  );
}

export default Interface;
