import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../src/style/style.css';

function Interface() {
  const [result, setResult] = useState('');
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [manualNav, setManualNav] = useState(false);
  const [uploadedImage, setUploadedImage] = useState('');
  const [segmentedImage, setSegmentedImage] = useState('');
  const [headerImages, setHeaderImages] = useState([
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4bW-zOzOjbTwNXEvguVe1AawtNlG8Fqe1XJ7mmBKSsw&s",
    "https://www.researchgate.net/publication/259714110/figure/fig3/AS:667714678964235@1536206993911/Examples-of-skin-lesion-images-from-the-different-classes-used-in-this-work.jpg",
    "https://lazaderm.com/wp-content/uploads/2020/01/LZ_PigmentedLesions-1-e1583847793564.jpg",
    "https://cdn.medizzy.com/1wLDOEemTOHuWCwuqcIcSllX0_I=/720x505/img/posts/77e40fbc-6dc7-4f25-a40f-bc6dc7ff25f7"
  ]);

  const diseaseNames = [
    "Actinic Keratosis",
    "Basal Cell Carcinoma",
    "Benign Keratosis",
    "Dermatofibroma",
    "Melanoma",
    "Nevus",
    "Vascular Lesion"
  ];

  useEffect(() => {
    if (!manualNav) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % headerImages.length);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [manualNav, headerImages.length]);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    setImage(URL.createObjectURL(file));

    try {
      const response = await axios.post('http://localhost:5000/process_image', formData);
      const predictedClass = response.data.message[0];
      const predictedProbability = response.data.message[1] * 100;
      const segmentedImgBase64 = response.data.message[2]; 

      setUploadedImage(URL.createObjectURL(file)); 
      setSegmentedImage(segmentedImgBase64); 

      setResult(predictedClass);
      if (!isNaN(predictedProbability)) {
        setMessage(`Probability: ${(predictedProbability).toFixed(2)}%.`);
      } else {
        setMessage(`The predicted disease is ${diseaseNames[predictedClass]}.`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % headerImages.length);
    setManualNav(true);
    resetManualNav();
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + headerImages.length) % headerImages.length);
    setManualNav(true);
    resetManualNav();
  };

  const resetManualNav = () => {
    setTimeout(() => {
      setManualNav(false);
    }, 3000);
  };

  return (
    <div className="container">
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Skin Lesion Detection</title>
      <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&family=Montserrat:wght@700&display=swap" rel="stylesheet" />
      <div className="header">
        <h1 className="title">SKIN LESION DETECTION</h1>
        <div className="header-image-wrapper">
          <button className="nav-button left" onClick={prevImage}>‹</button>
          <img className="header-image" src={headerImages[currentImageIndex]} alt="Header" />
          <button className="nav-button right" onClick={nextImage}>›</button>
          <div className="dots-container">
            {headerImages.map((_, index) => (
              <span key={index} className={`dot ${index === currentImageIndex ? 'active' : ''}`} onClick={() => setCurrentImageIndex(index)}></span>
            ))}
          </div>
        </div>
      </div>
      <div className="upload-file-image">
        <div className="upload-box">
          <h4 className="upload-title">Upload Image</h4>
          <input type="file" onChange={handleImageUpload} className="upload-input" />
        </div>
      </div>
      <div className="prediction-div">
        <div className="image-wrapper">
          {uploadedImage && <img className="uploaded-image" src={uploadedImage} alt="Uploaded" />}
          {segmentedImage && <img className="segmented-image" src={`data:image/png;base64, ${segmentedImage}`} alt="Segmented" />}
        </div>
        {result !== '' && (
          <h3 className="predicted-disease">
            The predicted disease is <span className="highlight">{diseaseNames[result]}</span>.
          </h3>
        )}
        {message !== '' && <p className="prediction-message">{message}</p>}
      </div>

    </div>
  );
}

export default Interface;
