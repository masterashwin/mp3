import React, { useState } from 'react';
import './UploadForm.css';

const UploadForm = ({ onAnalysisComplete, isLoading, setIsLoading }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
      const file = event.target.files[0]; // Get the first file user selected
    if (file && file.type === 'audio/mpeg') {
      setSelectedFile(file);
      setError('');
    } else {
      setSelectedFile(null);
      setError('Please select a valid MP3 file');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!selectedFile) {
      setError('Please select an MP3 file');
      return;
    }

    setIsLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://localhost:8080/api/analyse', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        onAnalysisComplete(data);
      } else {
        setError(data.error || 'Analysis failed');
      }
    } catch (err) {
      setError('Failed to connect to server. Make sure the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <h1>MP3 Audio Quality Analyzer</h1>
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="file-input-container">
          <input
            type="file"
            accept=".mp3,audio/mpeg"
            onChange={handleFileChange}
            disabled={isLoading}
            className="file-input"
          />
          <label className="file-input-label">
            {selectedFile ? selectedFile.name : 'Choose MP3 file...'}
          </label>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <button 
          type="submit" 
          disabled={!selectedFile || isLoading}
          className="submit-button"
        >
          {isLoading ? 'Analyzing...' : 'Analyze Audio'}
        </button>
      </form>
    </div>
  );
};

export default UploadForm;
