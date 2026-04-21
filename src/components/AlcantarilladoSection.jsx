import React from 'react';
import KpiCard from './KpiCard';

const AlcantarilladoSection = ({ currentData }) => {
  return (
    <section className="alcantarillado-section">
      <div className="section-header">
        <div className="section-icon section-icon--teal">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 6h20v12H2zM2 10h20M2 14h20"></path>
            <path d="M12 6v12"></path>
          </svg>
        </div>
        <h2 className="section-title">Alcantarillado</h2>
        <div style={{flex: 1, height: '1px', background: 'var(--border)', marginLeft: '10px'}}></div>
      </div>

      <div className="kpi-row kpi-row--2">
        <KpiCard 
            label="COBERTURA" 
            value={currentData?.coberturaAlcantarillado} 
            suffix="%" 
        />
        <KpiCard 
            label="USUARIOS" 
            value={currentData?.usuariosAlcantarillado} 
        />
      </div>
    </section>
  );
};

export default AlcantarilladoSection;
