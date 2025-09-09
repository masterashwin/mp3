import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import UploadForm from './pages/UploadForm';
import Results from './pages/Results';
import AudioEducation from './pages/AudioEducation';
import './styles/main.css';

function App() {
  const [analysisData, setAnalysisData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAnalysisComplete = (data) => {
    setAnalysisData(data);
  };

  const handleReset = () => {
    setAnalysisData(null);
  };

  return (
    <Router>
      <div className="page">
        <Routes>
          <Route 
            path="/" 
            element={
              <UploadForm 
                onAnalysisComplete={handleAnalysisComplete}
                isProcessing={isProcessing}
                setIsProcessing={setIsProcessing}
              />
            } 
          />
          
          <Route 
            path="/results" 
            element={
              analysisData ? (
                <Results 
                  data={analysisData}
                  onReset={handleReset}
                />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          
          <Route 
            path="/info" 
            element={<AudioEducation />} 
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
