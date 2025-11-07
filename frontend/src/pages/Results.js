import React from 'react';
import { useNavigate } from 'react-router-dom';
import InfoButton from '../components/InfoButton';
import Section from '../components/Section';
import InfoGridItem from '../components/InfoGridItem';
import MetricCard from '../components/MetricCard';
import LegendItem from '../components/LegendItem';
import LyricsBlock from '../components/LyricsBlock';

const Results = ({ data, onReset }) => {
  const navigate = useNavigate();
  const { metrics = {}, quality = {}, lyrics, song_info } = data || {};

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

  const getSummaryConfidence = (summary) => {
    if (!summary) return null;
    // backend may return an object { range: [...], confidence: x } or a tuple [range, confidence]
    if (typeof summary === 'object') {
      if (Array.isArray(summary)) return summary[1];
      return summary.confidence ?? null;
    }
    return null;
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
        
        <Section title="File Information">
          <div className="info-grid">
            <InfoGridItem label="File:">{metrics.file.split('/').pop()}</InfoGridItem>
            <InfoGridItem label="Duration:">{formatDuration(metrics.duration_sec)} ({metrics.duration_sec}s)</InfoGridItem>
          </div>
        </Section>

        <Section
          title="Audio Quality Metrics"
          actions={(
            <InfoButton onClick={() => navigate('/info')} title="Learn about audio quality metrics" />
          )}
        >
          <div className="grid grid--auto-fit">
            <MetricCard
              modifier={quality.bitrate_kbps}
              label="Bitrate"
              value={`${metrics.bitrate_kbps ?? 'N/A'} kbps`}
              qualityLabel={String(quality.bitrate_kbps ?? '').toUpperCase()}
              subRows={[
                { label: 'Real Source Quality:', value: formatCutoff(metrics.true_quality_estimation) },
                { label: 'Cutoff Type:', value: interpretConfidence(getSummaryConfidence(metrics.summaryCutOff)) },
                { label: 'Likely Audio Origin:', value: interpretSourceQuality(metrics.true_quality_estimation, getSummaryConfidence(metrics.summaryCutOff)) }
              ]}
            />

            <MetricCard
              modifier={quality.sample_rate_kHz}
              label="Sample Rate"
              value={`${metrics.sample_rate_kHz} kHz`}
              qualityLabel={quality.sample_rate_kHz.toUpperCase()}
            />

            <MetricCard
              modifier={quality.loudness_LUFS}
              label="Loudness"
              value={`${metrics.loudness_LUFS} LUFS`}
              qualityLabel={quality.loudness_LUFS.toUpperCase()}
            />
          </div>
        </Section>

        <div className="legend surface surface--padding-xl">
          <h3 className="legend__title text--xl text--semibold text--primary mb--md">Quality Levels</h3>
          <div className="legend__items">
            <LegendItem color={'var(--color-quality-golden)'} text={'Golden - Excellent quality'} />
            <LegendItem color={'var(--color-quality-green)'} text={'Green - Good quality'} />
            <LegendItem color={'var(--color-quality-yellow)'} text={'Yellow - Fair quality'} />
            <LegendItem color={'var(--color-quality-red)'} text={'Red - Poor quality'} />
          </div>
        </div>
        <LyricsBlock songInfo={song_info} lyrics={lyrics} />

        <button onClick={onReset} className="button button--secondary">
            ← Analyze Another File
        </button>
    </div>
  );
};

export default Results;
