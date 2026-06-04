import React, { useState } from 'react';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import Home from './Home';
import IndicatorsDashboard from './IndicatorsDashboard';
import ModulePlaceholder from './ModulePlaceholder';
import UserManagement from './UserManagement';

function AppLayout({ token, username, role, onLogout }) {
  const [activeView, setActiveView] = useState('home');
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  // Selector del contenido del área central basado en la vista activa
  const renderContent = () => {
    switch (activeView) {
      case 'home':
        return (
          <Home
            username={username}
            role={role}
            setActiveView={setActiveView}
          />
        );
      case 'indicators':
        return (
          <IndicatorsDashboard
            token={token}
            onUnauthorized={onLogout}
          />
        );
      case 'macromedidor':
        return (
          <ModulePlaceholder
            moduleName="Macromedidor Ciudadela MIA"
            description="Registro operativo de lecturas por hora de macromedidores y análisis acumulado diario para la Ciudadela MIA."
            icon={
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 6v6l4 2"></path>
              </svg>
            }
          />
        );
      case 'users':
        return (
          <UserManagement
            token={token}
            currentUsername={username}
            currentRole={role}
            onUnauthorized={onLogout}
          />
        );
      case 'audit':
        return (
          <ModulePlaceholder
            moduleName="Auditoría del Sistema"
            description="Bitácora de seguridad histórica para auditar los inicios de sesión y modificaciones de registros en el sistema."
            icon={
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            }
          />
        );
      case 'reports':
        return (
          <ModulePlaceholder
            moduleName="Reportes y Descargas"
            description="Exportador avanzado de base de datos e históricos a formatos binarios Excel (.xlsx) con filtros por fechas."
            icon={
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            }
          />
        );
      default:
        return <Home username={username} role={role} setActiveView={setActiveView} />;
    }
  };

  return (
    <div className={`app-layout ${sidebarExpanded ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Barra de Navegación Lateral */}
      <Sidebar
        role={role}
        activeView={activeView}
        setActiveView={setActiveView}
        expanded={sidebarExpanded}
      />

      {/* Área Principal de la Aplicación */}
      <div className="main-container">
        {/* Cabecera Superior Fija */}
        <Topbar
          username={username}
          role={role}
          onLogout={onLogout}
          sidebarExpanded={sidebarExpanded}
          setSidebarExpanded={setSidebarExpanded}
        />

        {/* Panel Central de Contenido Dinámico */}
        <main className="content-area">
          <div className="content-container">
            {renderContent()}
          </div>
        </main>

        {/* Pie de Página Fijo / Persistente */}
        <Footer />
      </div>
    </div>
  );
}

export default AppLayout;
