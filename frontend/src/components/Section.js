import React from 'react';

const Section = ({ title, actions, children }) => {
  return (
    <div className="section">
      <h2 className="title title--secondary">
        {title}
        {actions}
      </h2>
      {children}
    </div>
  );
};

export default Section;
