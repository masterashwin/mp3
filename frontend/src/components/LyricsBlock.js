import React from 'react';

const LyricsBlock = ({ songInfo, lyrics }) => {
  if (!lyrics || !songInfo) return null;

  return (
    <div className="section">
      <div className="lyrics surface surface--padding-lg">
        <div className="lyrics__header flex flex--between pb--md mb--md">
          <div className="lyrics__song-info flex flex--column gap--xs">
            <h3 className="lyrics__song-title text--lg text--bold text--primary m-0">{songInfo.song_name}</h3>
            <p className="lyrics__artist text--base text--secondary text--italic m-0">by {songInfo.artist_name}</p>
          </div>
        </div>
        <div className="lyrics__content surface--scrollable surface--padding-lg text--sm text--primary">
          {lyrics}
        </div>
      </div>
    </div>
  );
};

export default LyricsBlock;
