import React from 'react';

function ModulePlaceholder({ moduleName, description, icon }) {
  return (
    <div className="module-placeholder-view">
      <div className="placeholder-card">
        <div className="placeholder-icon-wrapper">
          {icon}
        </div>
        <span className="placeholder-badge">Próximamente</span>
        <h2 className="placeholder-title">{moduleName}</h2>
        <p className="placeholder-description">
          {description || 'Este módulo se encuentra en fase de desarrollo y estará disponible en una próxima versión.'}
        </p>
        
        <div className="placeholder-progress">
          <div className="progress-bar-label">Estado de la Integración</div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: '40%' }}></div>
          </div>
          <div className="progress-percentage">40% completado (Fase de Diseño)</div>
        </div>
      </div>
    </div>
  );
}

export default ModulePlaceholder;
