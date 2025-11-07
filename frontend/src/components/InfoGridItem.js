import React from 'react';

const InfoGridItem = ({ label, children }) => (
  <div className="info-grid__item surface surface--elevated surface--padding-lg">
    <span className="info-grid__label">{label}</span>
    {children}
  </div>
);

export default InfoGridItem;
