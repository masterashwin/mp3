import React from 'react';

const LegendItem = ({ color, text }) => (
  <div className="legend__item">
    <div className="legend__color" style={{ backgroundColor: color }} />
    <span className="legend__text text--sm text--secondary">{text}</span>
  </div>
);

export default LegendItem;
