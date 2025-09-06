import React from 'react';

const Results = ({ data, onReset }) => {
  const { metrics, quality, lyrics, song_info } = data;

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

return (
    <div className="card card--wide">
        <h1 className="title title--primary">MP3 Analysis Results</h1>
        
        <div className="section">
            <h2 className="title title--secondary">File Information</h2>
            <div className="info-grid">
            <div className="info-grid__item">
                <span className="info-grid__label">File:</span> 
                {metrics.file.split('/').pop()}
            </div>
            <div className="info-grid__item">
                <span className="info-grid__label">Duration:</span> 
                {formatDuration(metrics.duration_sec)} ({metrics.duration_sec}s)
            </div>
            </div>
        </div>

        <div className="section">
            <h2 className="title title--secondary">Audio Quality Metrics</h2>
            <div className="grid grid--auto-fit">
            <div className={`metric-card metric-card--${quality.bitrate_kbps}`}>
                <div className="metric-card__label">Bitrate</div>
                <div className="metric-card__value">{metrics.bitrate_kbps} kbps</div>
                <div className="metric-card__quality">{quality.bitrate_kbps.toUpperCase()}</div>
            </div>

            <div className={`metric-card metric-card--${quality.sample_rate_kHz}`}>
                <div className="metric-card__label">Sample Rate</div>
                <div className="metric-card__value">{metrics.sample_rate_kHz} kHz</div>
                <div className="metric-card__quality">{quality.sample_rate_kHz.toUpperCase()}</div>
            </div>

            <div className={`metric-card metric-card--${quality.loudness_LUFS}`}>
                <div className="metric-card__label">Loudness</div>
                <div className="metric-card__value">{metrics.loudness_LUFS} LUFS</div>
                <div className="metric-card__quality">{quality.loudness_LUFS.toUpperCase()}</div>
            </div>
            </div>
        </div>

        <div className="legend">
            <h3 className="legend__title">Quality Levels</h3>
            <div className="legend__items">
            <div className="legend__item">
                <div className="legend__color" style={{ backgroundColor: 'var(--color-quality-golden)' }}></div>
                <span className="legend__text">Golden - Excellent quality</span>
            </div>
            <div className="legend__item">
                <div className="legend__color" style={{ backgroundColor: 'var(--color-quality-green)' }}></div>
                <span className="legend__text">Green - Good quality</span>
            </div>
            <div className="legend__item">
                <div className="legend__color" style={{ backgroundColor: 'var(--color-quality-yellow)' }}></div>
                <span className="legend__text">Yellow - Fair quality</span>
            </div>
            <div className="legend__item">
                <div className="legend__color" style={{ backgroundColor: 'var(--color-quality-red)' }}></div>
                <span className="legend__text">Red - Poor quality</span>
            </div>
            </div>
        </div>

        {/* Conditional Lyrics Section */}
        {lyrics && song_info && song_info.song_name && song_info.artist_name && (
          <div className="section">
            <div className="lyrics">
              <div className="lyrics__header">
                <div className="lyrics__song-info">
                  <h3 className="lyrics__song-title">{song_info.song_name}</h3>
                  <p className="lyrics__artist">by {song_info.artist_name}</p>
                </div>
              </div>
              <div className="lyrics__content">
                {lyrics}
              </div>
            </div>
          </div>
        )}

        <button onClick={onReset} className="button button--secondary">
            ← Analyze Another File
        </button>
    </div>
  );
};

export default Results;
