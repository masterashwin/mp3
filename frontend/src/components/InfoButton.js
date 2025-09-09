import React from 'react';

const InfoButton = ({ onClick, title = "Learn more" }) => {
  return (
    <button 
      onClick={onClick}
      className="button button--info"
      title={title}
      type="button"
    >
    &#9432;
    </button>
  );
};

export default InfoButton;