import React, { useState } from 'react';
import axios from 'axios';
import '../src/style/style.css';

function Interface() {
  const [result, setResult] = useState('');
  const [message, setMessage] = useState(''); // Thêm state để lưu trữ thông báo trả về từ API
  const [image, setImage] = useState(null);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    setImage(URL.createObjectURL(file)); // Display the uploaded image

    try {
      const response = await axios.post('http://localhost:5000/process_image', formData);
      setResult(response.data.result_data); // Assuming response.data.result_data contains the result
      setMessage(response.data.message); // Assuming response.data.message contains the message
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container">
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Blood Cancer Disease Classification</title>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@200&display=swap" rel="stylesheet" />
      <div className="header">
        <h2>Welcome to the Skin Lesion Detection on Image</h2>
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4bW-zOzOjbTwNXEvguVe1AawtNlG8Fqe1XJ7mmBKSsw&s" alt="Header" />
      </div>
      <div className="upload-file-image">
        <h4>Upload the Image</h4>
        <input type="file" onChange={handleImageUpload} />
      </div>
      <hr />
      <div className="prediction-div">
        {image && <img src={image} alt="Uploaded" />}
        {result && (
          <h3 className="h3_block">
            The prediction of the image is <span>{result}</span>.
          </h3>
        )}
        {message && <p>{message}</p>} {/* Hiển thị thông báo trả về từ API */}
      </div>
    </div>
  );
}

export default Interface;
