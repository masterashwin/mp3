import React from 'react';
import { useNavigate } from 'react-router-dom';
import InfoButton from '../components/InfoButton';

const Results = ({ data, onReset }) => {
  const navigate = useNavigate();
  const { metrics, quality, lyrics, song_info } = data;

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatCutoff = (hz) => {
    if (!hz) return "Unknown";
    return `~${(hz / 1000).toFixed(1)} kHz`;
  };

  const interpretConfidence = (conf) => {
    if (conf == null) return "Unknown";

    if (conf < 0.25) return "Smooth (Youtube Opus-style)";
    if (conf < 0.6) return "Moderate Roll-off";
    return "Sharp Cutoff (AAC / low-bitrate)";
  };

  const interpretSourceQuality = (cutoffHz, confidence) => {
    if (!cutoffHz) return "Unknown";
    // Convert Hz → kHz for readability
    const khz = cutoffHz / 1000;
    if (khz < 16) return "Low Quality (~128 kbps AAC / older YouTube)";  // YouTube Low / AAC 128kbps
    if (khz < 18) return "YouTube Streaming Quality (~160 kbps Opus)"; // YouTube Opus ~160kbps
    if (khz < 20) return "High Quality MP3 (~256–320 kbps)";    // MP3 256–320 kbps
    return "Lossless / Very High Quality (FLAC / CD)";    // Lossless
  };

return (
    <div className="card card--wide">
        <h1 className="title title--primary">MP3 Analysis Results</h1>
        
        <div className="section">
          <h2 className="title title--secondary">File Information</h2>
          <div className="info-grid">
            <div className="info-grid__item surface surface--elevated surface--padding-lg">
              <span className="info-grid__label">File:</span> 
              {metrics.file.split('/').pop()}
            </div>
            <div className="info-grid__item surface surface--elevated surface--padding-lg">
              <span className="info-grid__label">Duration:</span> 
              {formatDuration(metrics.duration_sec)} ({metrics.duration_sec}s)
            </div>
          </div>
        </div>

        <div className="section">
          <h2 className="title title--secondary">Audio Quality Metrics
            <InfoButton 
              onClick={() => navigate('/info')}
              title="Learn about audio quality metrics"
            />
          </h2>
          <div className="grid grid--auto-fit">
            <div className={`metric-card metric-card--${quality.bitrate_kbps}`}>
                <div className="metric-card__label">Bitrate</div>
                <div className="metric-card__value">{metrics.bitrate_kbps} kbps</div>
                <div className="metric-card__quality">{quality.bitrate_kbps.toUpperCase()}</div>
                <hr className="metric-separator" />
                <div className="metric-card__sub">
                  <div className="metric-card__sub--label">Real Source Quality:</div>
                  <div className="metric-card__sub--value">{formatCutoff(metrics.true_quality_estimation)}</div>
                </div>
                <div className="metric-card__sub">
                  <div className="metric-card__sub--label">Cutoff Type:</div>
                  <div className="metric-card__sub--value">{interpretConfidence(metrics.summaryCutOff.confidence)}</div>
                </div>
                <hr className="metric-separator" />
                <div className="metric-card__sub">
                  <div className="metric-card__sub--label">Likely Audio Origin:</div>
                  <div className="metric-card__sub--value">
                    {interpretSourceQuality(metrics.true_quality_estimation, metrics.summaryCutOff.confidence)}
                  </div>
                </div>
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

        <div className="legend surface surface--padding-xl">
          <h3 className="legend__title text--xl text--semibold text--primary mb--md">Quality Levels</h3>
          <div className="legend__items">
            <div className="legend__item">
              <div className="legend__color" style={{ backgroundColor: 'var(--color-quality-golden)' }}></div>
              <span className="legend__text text--sm text--secondary">Golden - Excellent quality</span>
            </div>
            <div className="legend__item">
              <div className="legend__color" style={{ backgroundColor: 'var(--color-quality-green)' }}></div>
              <span className="legend__text text--sm text--secondary">Green - Good quality</span>
            </div>
            <div className="legend__item">
              <div className="legend__color" style={{ backgroundColor: 'var(--color-quality-yellow)' }}></div>
              <span className="legend__text text--sm text--secondary">Yellow - Fair quality</span>
            </div>
            <div className="legend__item">
              <div className="legend__color" style={{ backgroundColor: 'var(--color-quality-red)' }}></div>
              <span className="legend__text text--sm text--secondary">Red - Poor quality</span>
            </div>
          </div>
        </div>
        {/* Conditional Lyrics Section */}
        {lyrics && song_info && song_info.song_name && song_info.artist_name && (
          <div className="section">
            <div className="lyrics surface surface--padding-lg">
              <div className="lyrics__header flex flex--between pb--md mb--md">
                <div className="lyrics__song-info flex flex--column gap--xs">
                  <h3 className="lyrics__song-title text--lg text--bold text--primary m-0">{song_info.song_name}</h3>
                  <p className="lyrics__artist text--base text--secondary text--italic m-0">by {song_info.artist_name}</p>
                </div>
              </div>
              <div className="lyrics__content surface--scrollable surface--padding-lg text--sm text--primary">
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
