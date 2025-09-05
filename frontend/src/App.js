import React, { useState } from 'react';
import UploadForm from './UploadForm';
import Results from './Results';
import './styles/main.css';

function App() {
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalysisComplete = (data) => {
    setAnalysisData(data);
  };

  const handleReset = () => {
    setAnalysisData(null);
  };

  return (
    <div className="page">
      {!analysisData ? (
        <UploadForm 
          onAnalysisComplete={handleAnalysisComplete}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      ) : (
        <Results 
          data={analysisData}
          onReset={handleReset}
        />
      )}
    </div>
  );
}

export default App;
