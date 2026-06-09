import React, { useState } from 'react';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import Home from './Home';
import IndicatorsDashboard from './IndicatorsDashboard';
import ModulePlaceholder from './ModulePlaceholder';
import UserManagement from './UserManagement';
import MacromedicionMiaPage from './MacromedicionMiaPage';
import AuditLogPage from './AuditLogPage';

function AppLayout({ token, username, role, userId, onLogout }) {
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
          <MacromedicionMiaPage
            token={token}
            currentUsername={username}
            currentRole={role}
            currentUserId={userId}
            onUnauthorized={onLogout}
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
          <AuditLogPage
            token={token}
            currentUsername={username}
            currentRole={role}
            onUnauthorized={onLogout}
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
        setSidebarExpanded={setSidebarExpanded}
      />

      {/* Área Principal de la Aplicación */}
      <div className="main-container">
        {/* Cabecera Superior Fija */}
        <Topbar
          username={username}
          role={role}
          onLogout={onLogout}
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
