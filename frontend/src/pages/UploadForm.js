import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InfoButton from '../components/InfoButton';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

const UploadForm = ({ onAnalysisComplete, isProcessing, setIsProcessing }) => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [songName, setSongName] = useState('');
  const [artistName, setArtistName] = useState('');
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

    const hasSongName = songName.trim() !== '';
    const hasArtistName = artistName.trim() !== '';
    
    if (hasSongName !== hasArtistName) {
      setError('Please provide both song name and artist name, or leave both empty');
      return;
    }

    setIsProcessing(true);
    setError('');

    const formData = new FormData();
    formData.append('file', selectedFile);
    
    if (hasSongName && hasArtistName) {
      formData.append('songName', songName.trim());
      formData.append('artistName', artistName.trim());
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/analyse`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        onAnalysisComplete(data);
        navigate('/results'); // Navigate to results page
      } else {
        setError(data.error || 'Analysis failed');
      }
    } catch (err) {
      setError('Failed to connect to server. Make sure the backend is running.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="card">
      <h1 className="title title--primary">MP3 Audio Quality Analyzer
        <InfoButton 
              onClick={() => navigate('/info')}
              title="Learn about audio quality metrics"
            />
      </h1>
      <form onSubmit={handleSubmit} className="upload-form flex flex--column gap--lg">
        <div className="upload-form__field">
          <input
            type="file"
            accept=".mp3,audio/mpeg"
            onChange={handleFileChange}
            disabled={isProcessing}
            className={`upload-form__input ${isProcessing ? 'upload-form__input--disabled' : ''}`}
          />
          <label className={`upload-form__label ${isProcessing ? 'upload-form__label--disabled' : ''}`}>
            {selectedFile ? selectedFile.name : 'Choose MP3 file...'}
          </label>
        </div>

        <div className="upload-form__section surface--subtle surface--padding-lg">
          <h3 className="upload-form__section-title text--lg text--bold text--primary mb--sm">Optional: Get Lyrics</h3>
          <p className="upload-form__description text--sm text--secondary mb--md">
            Fill both fields to include lyrics in your analysis (leave both empty to skip)
          </p>
          
          <div className="upload-form__field mb--md">
            <input
              type="text"
              placeholder="Song name"
              value={songName}
              onChange={(e) => setSongName(e.target.value)}
              disabled={isProcessing}
              className={`upload-form__text-input ${isProcessing ? 'upload-form__text-input--disabled' : ''}`}
            />
          </div>
          
          <div className="upload-form__field">
            <input
              type="text"
              placeholder="Artist name"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              disabled={isProcessing}
              className={`upload-form__text-input ${isProcessing ? 'upload-form__text-input--disabled' : ''}`}
            />
          </div>
        </div>
        
        {error && <div className="alert alert--error">{error}</div>}
        
        <button 
          type="submit" 
          disabled={!selectedFile || isProcessing}
          className={`button button--primary ${(!selectedFile || isProcessing) ? 'button--disabled' : ''} ${isProcessing ? 'button--loading' : ''}`}
        >
          {isProcessing ? 'Analyzing...' : 'Analyze Audio'}
        </button>
      </form>
    </div>
  );
};

export default UploadForm;
