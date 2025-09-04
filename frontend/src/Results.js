import React from 'react';
import './Results.css';

const Results = ({ data, onReset }) => {
  const { metrics, quality } = data;

  const getQualityColor = (qualityLevel) => {
    switch (qualityLevel) {
      case 'golden': return '#FFD700';
      case 'green': return '#90EE90';
      case 'yellow': return '#FFFF99';
      case 'red': return '#FFB6C1';
      default: return '#f8f9fa';
    }
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="results-container">
      <h1>MP3 Analysis Results</h1>
      
      <div className="file-info-section">
        <h2>File Information</h2>
        <div className="info-grid">
          <div className="info-item">
            <strong>File:</strong> {metrics.file.split('/').pop()}
          </div>
          <div className="info-item">
            <strong>Duration:</strong> {formatDuration(metrics.duration_sec)} ({metrics.duration_sec}s)
          </div>
        </div>
      </div>

      <div className="quality-section">
        <h2>Audio Quality Metrics</h2>
        <div className="metrics-grid">
          <div 
            className="metric-card"
            style={{ backgroundColor: getQualityColor(quality.bitrate_kbps) }}
          >
            <div className="metric-label">Bitrate</div>
            <div className="metric-value">{metrics.bitrate_kbps} kbps</div>
            <div className="metric-quality">{quality.bitrate_kbps.toUpperCase()}</div>
          </div>

          <div 
            className="metric-card"
            style={{ backgroundColor: getQualityColor(quality.sample_rate_kHz) }}
          >
            <div className="metric-label">Sample Rate</div>
            <div className="metric-value">{metrics.sample_rate_kHz} kHz</div>
            <div className="metric-quality">{quality.sample_rate_kHz.toUpperCase()}</div>
          </div>

          <div 
            className="metric-card"
            style={{ backgroundColor: getQualityColor(quality.loudness_LUFS) }}
          >
            <div className="metric-label">Loudness</div>
            <div className="metric-value">{metrics.loudness_LUFS} LUFS</div>
            <div className="metric-quality">{quality.loudness_LUFS.toUpperCase()}</div>
          </div>
        </div>
      </div>

      <div className="quality-legend">
        <h3>Quality Levels</h3>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#FFD700' }}></div>
            <span>Golden - Excellent quality</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#90EE90' }}></div>
            <span>Green - Good quality</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#FFFF99' }}></div>
            <span>Yellow - Fair quality</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#FFB6C1' }}></div>
            <span>Red - Poor quality</span>
          </div>
        </div>
      </div>

      <button onClick={onReset} className="reset-button">
        ← Analyze Another File
      </button>
    </div>
  );
};

export default Results;
