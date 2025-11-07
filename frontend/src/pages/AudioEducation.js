import React from 'react';
import { useNavigate } from 'react-router-dom';
import Section from '../components/Section';

const AudioEducation = () => {
  const navigate = useNavigate();

  return (
    <div className="card card--wide">
      <button onClick={() => navigate(-1)} className="button button--secondary button--back">
        ← Back
      </button>

      <h1 className="title title--primary">Understanding Audio Quality</h1>

      <p className="text--base text--secondary">
        This page explains the key ideas behind how audio quality works — in simple, clear terms.
        You don’t need to be an audio engineer to understand this. Once you grasp these basics,
        you'll instantly be able to tell whether a file is truly high quality or just pretending.
      </p>
      <Section title={'1. Bitrate (What the File *Claims*)'}>
        <p className="text--base text--secondary">
          Bitrate is the amount of data used per second, measured in <b>kbps</b>.
          A higher bitrate <i>usually</i> means better quality — but this value can be misleading.
        </p>
        <p className="text--base text--secondary">
          For example, many download websites take YouTube-quality audio (~160 kbps) and
          re-save it as a <b>320 kbps MP3</b>. This makes the file look high-quality, but the sound
          inside hasn’t improved — it's the same audio, just in a bigger file.
        </p>
      </Section>
      <Section title={'2. Real Source Quality (Cutoff Frequency in kHz)'}>
        <p className="text--base text--secondary">
          Music contains frequencies ranging from deep bass up to very high treble.
          <b>High-quality audio preserves details up to ~20 kHz.</b>
        </p>
        <p className="text--base text--secondary">
          When audio is compressed, the highest frequencies are removed first. So the
          highest audible frequency (called the <b>cutoff</b>) tells us the <i>true</i> quality of the audio.
        </p>

        <ul className="text--base text--secondary">
          <li><b>~20 kHz</b> → Lossless / CD quality</li>
          <li><b>~19–20 kHz</b> → High-quality MP3 (256–320 kbps)</li>
          <li><b>~17–18 kHz</b> → YouTube / Spotify Free (~160 kbps)</li>
          <li><b>~15–16 kHz</b> → Low-quality MP3 / older streams</li>
        </ul>
      </Section>
      <Section title={'3. Cutoff Shape & "Confidence"'}>
        <p className="text--base text--secondary">
          The <b>shape</b> of the cutoff reveals how the file was encoded:
        </p>

        <ul className="text--base text--secondary">
          <li><b>Smooth fade</b> → YouTube / Opus streaming (normal)</li>
          <li><b>Sharp drop</b> → AAC 128 kbps or older MP3 compression</li>
        </ul>

        <p className="text--base text--secondary">
          This is what the <b>confidence</b> value means — not “how sure” the system is,
          but whether the cutoff is smooth or sharp.
        </p>
      </Section>

      <Section title={'4. Sample Rate & Bit Depth'}>
        <p className="text--base text--secondary">
          These describe how the audio was originally captured:
        </p>

        <ul className="text--base text--secondary">
          <li><b>Sample Rate</b>: how many “snapshots” of sound are taken per second (e.g. 44.1 kHz)</li>
          <li><b>Bit Depth</b>: how much detail each snapshot can hold (e.g. 16-bit vs 24-bit)</li>
        </ul>

        <p className="text--base text--secondary">
          Higher sample rate and bit depth help <i>only</i> if the bitrate is high enough.
        </p>
      </Section>

      <Section title={'5. Loudness (LUFS vs dBFS)'}>
        <p className="text--base text--secondary">
          We used to measure loudness using <b>dBFS</b> (digital peak level).
          But the human ear does not hear all frequencies equally.
        </p>

        <p className="text--base text--secondary">
          <b>LUFS</b> measures how loud audio <i>feels</i> to humans — so it is now the modern standard
          (used by Spotify, Apple, YouTube, etc.).
        </p>

        <ul className="text--base text--secondary">
          <li><b>-14 LUFS</b> → typical streaming level</li>
          <li><b>-8 to -10 LUFS</b> → loud modern pop</li>
          <li><b>-18+ LUFS</b> → more dynamic / softer masters</li>
        </ul>
      </Section>

      <Section title={'6. Streaming Platform Quality'}>
        <ul className="text--base text--secondary">
          <li><b>YouTube</b>: ~160 kbps Opus</li>
          <li><b>Spotify Free</b>: ~160 kbps Ogg</li>
          <li><b>Spotify Premium</b>: 320 kbps Ogg</li>
          <li><b>Apple Music</b>: 256 kbps AAC</li>
          <li><b>Tidal / Apple Music Lossless</b>: FLAC / ALAC (true lossless)</li>
        </ul>
      </Section>

      <Section title={'7. Bluetooth Playback Quality'}>
        <p className="text--base text--secondary">
          Even if your file is high quality, Bluetooth can compress it again during playback.
        </p>

        <ul className="text--base text--secondary">
          <li><b>SBC</b>: default Bluetooth (can sound rough)</li>
          <li><b>AAC</b>: used on iPhones (decent, but not lossless)</li>
          <li><b>aptX / aptX HD</b>: better on some Android devices</li>
          <li><b>LDAC</b>: Sony high-resolution Bluetooth (best wireless option)</li>
        </ul>
      </Section>

      <Section title={'8. How to Read Your Results'}>
        <p className="text--base text--secondary">
          • <b>Bitrate</b> = what the file claims<br />
          • <b>Real Source Quality</b> = the truth (based on cutoff)<br />
          • <b>Cutoff Type</b> = hints where it came from (YouTube, MP3, lossless, etc.)<br />
          • <b>LUFS</b> = how loud and punchy it feels<br />
        </p>
      </Section>

      <Section title={'9. Quick Interpretation'}>
        <p className="text--base text--secondary">
          If the bitrate looks high but the <b>real source quality</b> shows ~17–18 kHz,
          the file probably came from YouTube. If you see ~19–20 kHz, it's a real high-quality MP3.
        </p>
      </Section>
    </div>
  );
};

export default AudioEducation;
