import React from 'react';

const KpiCard = ({ label, value, type, suffix = '', highlight = false, ianc = false, dot = false }) => {
  let displayValue = value;

  if (value === null || value === undefined) {
    displayValue = '--';
  } else if (typeof value === 'number') {
    // Si es un número muy grande, formatear con K
    if (value > 1000 && !suffix.includes('%')) {
      displayValue = (value / 1000).toLocaleString('en-US', { maximumFractionDigits: 1 }) + 'k';
    } else {
      displayValue = value.toLocaleString('en-US', {
        maximumFractionDigits: 1,
        minimumFractionDigits: value % 1 !== 0 ? 1 : 0
      });
    }
  }

  const cardClass = `kpi-card ${highlight ? 'kpi-card--highlight' : ''} ${ianc ? 'kpi-card--ianc' : ''}`;
  const valueClass = `kpi-value ${highlight ? 'kpi-value--green' : ''} ${ianc ? 'kpi-value--blue' : ''}`;

  return (
    <div className={cardClass}>
      <div className="kpi-label">{label}</div>
      <div className={valueClass}>
        {displayValue}{suffix && displayValue !== '--' ? suffix : ''}
      </div>
      {dot && <div className="kpi-dot"></div>}
    </div>
  );
};

export default KpiCard;
