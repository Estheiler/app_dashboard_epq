import React from 'react';

const AseoSection = ({ currentData, previousData }) => {
  const calcVariation = (current, prev) => {
    if (!current || !prev) return null;
    return ((current - prev) / prev) * 100;
  };

  const barridoVar = calcVariation(currentData?.barrido, previousData?.barrido);
  const residuosVar = calcVariation(currentData?.produccionResiduos, previousData?.produccionResiduos);

  // Normalización para las barras de progreso (asumiendo metas razonables o simplemente visual)
  const barridoProgress = Math.min(100, (currentData?.barrido / 3500) * 100) || 0;
  const residuosProgress = Math.min(100, (currentData?.produccionResiduos / 3000) * 100) || 0;

  return (
    <section className="section-card">
      <div className="section-header">
        <div className="section-icon section-icon--green">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </div>
        <h2 className="section-title">Aseo</h2>
      </div>

      <div className="kpi-row kpi-row--2" style={{marginBottom: '20px'}}>
        <div>
          <div className="kpi-label">COBERTURA</div>
          <div className="kpi-value" style={{fontSize: '18px'}}>{currentData?.coberturaAseo?.toFixed(1) || '--'}%</div>
        </div>
        <div style={{textAlign: 'right'}}>
          <div className="kpi-label">CONTINUIDAD</div>
          <div className="kpi-value" style={{fontSize: '18px'}}>{currentData?.continuidadAseo || '--'}%</div>
        </div>
      </div>

      <div className="progress-item">
        <div className="progress-label-row">
          <div className="progress-label">KM DE BARRIDO MENSUAL</div>
        </div>
        <div className="progress-value-row">
          <div className="progress-value">{currentData?.barrido?.toLocaleString() || '--'} km</div>
          {barridoVar !== null && (
            <span className={`progress-badge ${barridoVar >= 0 ? 'progress-badge--up' : 'progress-badge--down'}`}>
              {barridoVar >= 0 ? '+' : ''}{barridoVar.toFixed(0)}%
            </span>
          )}
        </div>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${barridoProgress}%`, background: 'var(--blue)' }}></div>
        </div>
      </div>

      <div className="progress-item" style={{marginBottom: 0}}>
        <div className="progress-label-row">
          <div className="progress-label">PRODUCCIÓN DE RESIDUOS (TON)</div>
        </div>
        <div className="progress-value-row">
          <div className="progress-value">{currentData?.produccionResiduos?.toLocaleString() || '--'} T</div>
          {residuosVar !== null && (
            <span className={`progress-badge ${residuosVar >= 0 ? 'progress-badge--down' : 'progress-badge--up'}`}>
              {residuosVar >= 0 ? '+' : ''}{residuosVar.toFixed(0)}%
            </span>
          )}
        </div>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${residuosProgress}%`, background: 'var(--blue)' }}></div>
        </div>
      </div>
    </section>
  );
};

export default AseoSection;
