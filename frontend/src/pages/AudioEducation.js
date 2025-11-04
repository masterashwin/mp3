import React from 'react';
import { useNavigate } from 'react-router-dom';

const AudioEducation = () => {
  const navigate = useNavigate();

  return (
    <div className="card card--wide">
      <button onClick={() => navigate(-1)} className="button button--secondary button--back">
        ← Back
      </button>
      <h1 className="title title--primary">Understanding Audio Quality Metrics</h1>

      <div className="section">
        <h2 className="title title--secondary">Basic questions</h2>
        <p className="text--base text--secondary">
          This page will contain detailed explanations about:
        </p>
        <ol className="text--base text--secondary">
          <li><b>What is bitrate and why it matters:</b>
            The amount of data transmitted per second measured in kbps - kilobits per second.
            A higher bit rate means less compression and better audio quality but also requires more bandwidth.
            Bit rate is the most important factor for Bluetooth sound quality. Bit depth and sample rate help,
            but only if bit rate is high enough</li>
          <li><b>Sample rate explained:</b> The number of samples of audio carried per second, measured in Hz or kHz.
            Higher sample rates can capture more detail but also increase file size.</li>
          <li><b>Bit Depth explained:</b> Defines the dynamic range, or the difference between the quietest and
            loudest sounds. Higher bit depth improves clarity and reduces background noise.</li>
          <li><b>LUFS loudness measurement:</b> A standard for measuring perceived loudness in audio,
            helping to ensure consistent volume levels across different tracks.</li>
          <li><b>LUFS vs dBFS:</b> dBFS is a precise measurement of amplitude peaks in a digital signal.
            dBFS is solely a measurement of electrical level, without human perceptual filters like LUFS.</li>
          <li><b>Quality benchmarks and ratings:</b> Various metrics and standards used to evaluate audio quality,
            including subjective and objective measures.</li>
        </ol>
      </div>
    </div>
  );
};

export default AudioEducation;