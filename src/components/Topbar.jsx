import React from 'react';

function Topbar({ username, role, onLogout }) {
  // Traducir roles para mostrarlos de manera amigable
  const getRoleLabel = (r) => {
    if (!r) return 'Usuario';
    const upper = r.toUpperCase();
    if (upper === 'SUPERADMIN') return 'Super Admin';
    if (upper === 'ADMIN') return 'Administrador';
    if (upper === 'HIDRAULICO') return 'Ing. Hidráulico';
    if (upper === 'OPERARIO') return 'Operario';
    return r;
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-brand">
          <img src="/logo_epq_horizontal.png" alt="EPQ" className="topbar-logo" />
          <span className="topbar-title-desktop">Plataforma de Gestión Operativa</span>
        </div>
      </div>

      <div className="topbar-right">
        {username && (
          <div className="user-profile-widget">
            <div className="user-avatar-badge">
              {username.charAt(0).toUpperCase()}
            </div>
            <div className="user-info-text">
              <span className="user-profile-name">{username}</span>
              <span className="user-profile-role">{getRoleLabel(role)}</span>
            </div>
          </div>
        )}

        <button className="logout-action-btn" onClick={onLogout} title="Cerrar Sesión">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span className="logout-text">Salir</span>
        </button>
      </div>
    </header>
  );
}

export default Topbar;
