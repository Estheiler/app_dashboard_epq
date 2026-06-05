import React from 'react';

function PublicHeader({ onNavigateToLogin }) {
  return (
    <header className="public-header">
      <div className="public-header-left">
        <img src="/logo_epq_horizontal.png" alt="Logo EPQ" className="public-logo" />
        <div className="public-header-title-container">
          <h1 className="public-header-title">Indicadores de Gestión</h1>
          <span className="public-header-subtitle">Empresas Públicas de Quibdó E.S.P. en Liquidación</span>
        </div>
      </div>
      <div className="public-header-right">
        <button className="portal-btn" onClick={onNavigateToLogin} title="Ingresar al Portal Interno">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="portal-icon">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
            <polyline points="10 17 15 12 10 7"></polyline>
            <line x1="15" y1="12" x2="3" y2="12"></line>
          </svg>
          <span>Portal</span>
        </button>
      </div>
    </header>
  );
}

export default PublicHeader;
