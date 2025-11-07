import React from 'react';

const MetricCard = ({ modifier, label, value, qualityLabel, subRows = [] }) => {
  const modClass = modifier ? ` metric-card--${modifier}` : '';
  return (
    <div className={`metric-card${modClass}`}>
      <div className="metric-card__label">{label}</div>
      <div className="metric-card__value">{value}</div>
      {qualityLabel && <div className="metric-card__quality">{qualityLabel}</div>}

      {subRows.length > 0 && <hr className="metric-separator" />}

      {subRows.map((r, i) => (
        <div key={i} className="metric-card__sub">
          <div className="metric-card__sub--label">{r.label}</div>
          <div className="metric-card__sub--value">{r.value}</div>
        </div>
      ))}
    </div>
  );
};

export default MetricCard;
