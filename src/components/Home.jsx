import React from 'react';

function Home({ username, role, setActiveView }) {
  const getRoleLabel = (r) => {
    if (!r) return 'Usuario';
    const upper = r.toUpperCase();
    if (upper === 'SUPERADMIN') return 'Super Administrador';
    if (upper === 'ADMIN') return 'Administrador';
    if (upper === 'HIDRAULICO') return 'Ingeniero Hidráulico';
    if (upper === 'OPERARIO') return 'Operario de Planta';
    return r;
  };

  const modules = [
    {
      id: 'indicators',
      label: 'Indicadores Técnicos',
      description: 'Visualiza y analiza los indicadores clave de rendimiento (KPIs) de Acueducto, Alcantarillado y Aseo en gráficos dinámicos.',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
      ),
      roles: ['superadmin', 'admin', 'hidraulico', 'operario'],
      isFuture: false,
    },
    {
      id: 'macromedidor',
      label: 'Macromedidor Ciudadela MIA',
      description: 'Control operativo de macromedición. Registro de lecturas por hora, cálculos de consumos acumulados diarios e históricos.',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
          <path d="M12 6v6l4 2"></path>
        </svg>
      ),
      roles: ['superadmin', 'admin', 'hidraulico', 'operario'],
      isFuture: false,
    },
    {
      id: 'users',
      label: 'Gestión de Usuarios',
      description: 'Administración de cuentas de operarios e hidráulicos, control de accesos, roles y restablecimiento de credenciales.',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
      roles: ['superadmin', 'admin'],
      isFuture: true,
    },
    {
      id: 'audit',
      label: 'Auditoría y Bitácora',
      description: 'Bitácora detallada de auditoría. Registro de acciones sobre usuarios, inicios de sesión y modificaciones de registros.',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      ),
      roles: ['superadmin', 'admin'],
      isFuture: true,
    },
    {
      id: 'reports',
      label: 'Reportes y Descargas',
      description: 'Exportación avanzada de bases de datos operativas e indicadores a archivos Excel con filtros por rango de fechas.',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
      ),
      roles: ['superadmin', 'admin', 'hidraulico'],
      isFuture: true,
    }
  ];

  const hasAccess = (item) => {
    if (!item.roles) return true;
    if (!role) return false;
    return item.roles.includes(role.toLowerCase());
  };

  const allowedModules = modules.filter(hasAccess);

  return (
    <div className="home-view">
      <div className="home-welcome-card">
        <h1 className="home-welcome-title">¡Hola, {username}!</h1>
        <p className="home-welcome-subtitle">
          Bienvenido al Portal de Gestión Operativa de EPQ S.A. E.S.P. Has ingresado con el perfil de <strong>{getRoleLabel(role)}</strong>.
        </p>
      </div>

      <div className="home-modules-section">
        <h2 className="home-section-title">Módulos Disponibles</h2>
        <p className="home-section-subtitle">Selecciona una de las siguientes opciones para comenzar a trabajar:</p>

        <div className="home-modules-grid">
          {allowedModules.map((item) => (
            <div
              key={item.id}
              className={`module-card ${item.isFuture ? 'future' : 'active'}`}
              onClick={() => setActiveView(item.id)}
            >
              <div className="module-card-icon">{item.icon}</div>
              <div className="module-card-body">
                <h3 className="module-card-title">
                  {item.label}
                  {item.isFuture && <span className="card-future-tag">Próximamente</span>}
                </h3>
                <p className="module-card-desc">{item.description}</p>
                <div className="module-card-footer">
                  {item.isFuture ? (
                    <span className="card-footer-link locked">Módulo en Desarrollo</span>
                  ) : (
                    <span className="card-footer-link">Ingresar al Módulo &rarr;</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
