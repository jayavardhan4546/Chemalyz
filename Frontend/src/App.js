import React, { useState, useRef } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import './App.css';

const Navbar = () => (
  <nav className="navbar navbar-expand-lg sticky-top custom-navbar">
    <div className="container">
      <a className="navbar-brand" href="#">Chemalyze</a>
      <button
        className="navbar-toggler border-0"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
        <ul className="navbar-nav">
          <li className="nav-item"><a className="nav-link text-white" href="#home">Home</a></li>
          <li className="nav-item"><a className="nav-link text-white" href="#about">About</a></li>
          <li className="nav-item"><a className="nav-link text-white" href="#contact">Contact Us</a></li>
        </ul>
      </div>
    </div>
  </nav>
);

const App = () => {
  const [isCameraStarted, setIsCameraStarted] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [ocrResult, setOcrResult] = useState('');
  const [generatedOutput, setGeneratedOutput] = useState('');
  const [showGeneratedOutput, setShowGeneratedOutput] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      setIsCameraStarted(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraStarted(false);
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL('image/png');
    setCapturedImage(imageData);
    stopCamera();
    sendImageToBackend(imageData);
  };

  const sendImageToBackend = async (imageData) => {
    const formData = new FormData();
    formData.append('image', dataURItoBlob(imageData));

    try {
      const response = await fetch('http://localhost:5000/analyze', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setOcrResult(data.extractedText);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const dataURItoBlob = (dataURI) => {
    const byteString = atob(dataURI.split(',')[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }
    return new Blob([uint8Array], { type: 'image/png' });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setCapturedImage(e.target.result);
      sendImageToBackend(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const generateOutput = async () => {
    try {
      const response = await fetch('http://localhost:5000/generate', { method: 'GET' });
      const data = await response.json();
      setGeneratedOutput(data.generatedText);
      setShowGeneratedOutput(true);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const resetAll = () => {
    stopCamera();
    setCapturedImage(null);
    setOcrResult('');
    setGeneratedOutput('');
    setShowGeneratedOutput(false);
  };

  return (
    <div>
      <Navbar />
      <div className="container mt-5 d-flex flex-column align-items-center">
        <div className="upload-box">
          {isCameraStarted ? (
            <>
              <video ref={videoRef} autoPlay className="video-stream"></video>
              <button className="btn btn-primary mt-3" onClick={captureImage}>Capture</button>
              <button className="btn btn-danger mt-3" onClick={stopCamera}>Stop Camera</button>
            </>
          ) : (
            <>
              <button className="btn btn-success" onClick={startCamera}>Start Camera</button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="form-control mt-3"
              />
            </>
          )}
        </div>

        {capturedImage && (
          <div className="output-box">
            <h4>Captured Image</h4>
            <img src={capturedImage} alt="Captured" className="captured-image" />
          </div>
        )}

        {ocrResult && (
          <div className="output-box">
            <h4>Extracted Text</h4>
            <p>{ocrResult}</p>
            <button className="btn btn-warning mt-2" onClick={generateOutput}>Generate Analysis</button>
          </div>
        )}

        {showGeneratedOutput && (
          <div className="border rounded p-3 bg-light shadow-sm" style={{ width: "45%" }}>
            <h5 className="text-dark">Generated Output</h5>
            <pre className="text-dark output-text">
              {generatedOutput}
            </pre>
          </div>
        )}

        <About />
        <Contact />
      </div>
    </div>
  );
};

const About = () => (
  <div id="about" className="section">
    <h2>About Chemalyze</h2>
    <p>
      Chemalyze is an AI-powered tool that analyzes chemical compositions from product images. 
      Using OCR and AI models, it extracts chemical names and provides insights into their properties, benefits, and risks.
    </p>
  </div>
);

const Contact = () => (
  <div id="contact" className="section">
    <h2>Contact Us</h2>
    <p>
      We’d love to hear from you! Reach out for questions, feedback, or assistance.
      <br /><br />
      Email: anupojusravanthirani@example.com
      <br />
      Email: gjayavardhan17@example.com
    </p>
  </div>
);

export default App;
