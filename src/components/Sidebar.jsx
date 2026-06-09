import React from 'react';
import './Sidebar.css';

function Sidebar({ role, activeView, setActiveView, expanded, setSidebarExpanded }) {
  const getRoleLabel = (r) => {
    if (!r) return '';
    const upper = r.toUpperCase();
    if (upper === 'SUPERADMIN') return 'Superadmin';
    if (upper === 'ADMIN') return 'Administrador';
    if (upper === 'HIDRAULICO') return 'Ing. Hidráulico';
    if (upper === 'OPERARIO') return 'Operario';
    return r;
  };

  const menuItems = [
    {
      id: 'home',
      label: 'Inicio',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      ),
      roles: ['superadmin', 'admin', 'hidraulico', 'operario'],
    },
    {
      id: 'indicators',
      label: 'Indicadores Técnicos',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
      ),
      roles: ['superadmin', 'admin', 'hidraulico', 'operario'],
    },
    {
      id: 'macromedidor',
      label: 'Macromedidor',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
          <path d="M12 6v6l4 2"></path>
        </svg>
      ),
      roles: ['superadmin', 'admin', 'hidraulico', 'operario'],
    },
    {
      id: 'users',
      label: 'Usuarios',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
      roles: ['superadmin', 'admin'],
    },
    {
      id: 'audit',
      label: 'Auditoría',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      ),
      roles: ['superadmin', 'admin'],
    }
  ];

  const hasAccess = (item) => {
    if (!item.roles) return true;
    if (!role) return false;
    return item.roles.includes(role.toLowerCase());
  };

  const visibleItems = menuItems.filter(hasAccess);

  return (
    <aside className={`sidebar ${expanded ? 'expanded' : 'collapsed'}`}>
      <div className="sidebar-header">
        {expanded ? (
          <>
            <div className="logo-box">
              <img src="/logo_epq.png" alt="EPQ" className="sidebar-logo" />
            </div>
            <div className="brand-text">
              <span className="brand-title">Portal EPQ</span>
              <span className="brand-badge">{getRoleLabel(role)}</span>
            </div>
            <button
              className="sidebar-toggle-in"
              onClick={() => setSidebarExpanded(false)}
              aria-label="Contraer menú"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
          </>
        ) : (
          <button
            className="sidebar-toggle-in collapsed-toggle"
            onClick={() => setSidebarExpanded(true)}
            aria-label="Expandir menú"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        )}
      </div>

      <nav className="sidebar-nav">
        {visibleItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`nav-item ${isActive ? 'active' : ''} ${item.isFuture ? 'future-module' : ''}`}
              title={!expanded ? item.label : undefined}
            >
              <div className="nav-item-icon">{item.icon}</div>
              {expanded && (
                <div className="nav-item-content">
                  <span className="nav-item-label">{item.label}</span>
                  {item.isFuture && <span className="future-tag">Próx.</span>}
                </div>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;
