import React from 'react';
import { useNavigate } from 'react-router-dom';

const AudioEducation = () => {
  const navigate = useNavigate();
  
  return (
    <div className="card card--wide">
      <div className="flex flex--between mb--lg">
        <h1 className="title title--primary">Understanding Audio Quality Metrics</h1>
        <button onClick={() => navigate(-1)} className="button button--secondary">
          ← Back
        </button>
      </div>
      
      <div className="section">
        <h2 className="title title--secondary">COUCOU</h2>
        <p className="text--base text--secondary">
        </p>
        <ul className="text--base text--secondary" style={{ marginLeft: '20px', marginTop: '10px' }}>
          
        </ul>
      </div>
    </div>
  );
};

export default AudioEducation;