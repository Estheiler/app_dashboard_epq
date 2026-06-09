import React, { useState } from 'react';
import Login from './components/Login';
import AppLayout from './components/AppLayout';
import PublicHeader from './components/PublicHeader';
import IndicatorsDashboard from './components/IndicatorsDashboard';

function App() {
  const [token, setToken] = useState(localStorage.getItem('epq_token'));
  const [username, setUsername] = useState(localStorage.getItem('epq_username'));
  const [role, setRole] = useState(localStorage.getItem('epq_role'));
  const [userId, setUserId] = useState(localStorage.getItem('epq_user_id'));
  const [currentScreen, setCurrentScreen] = useState(
    localStorage.getItem('epq_token') ? 'portal' : 'public-indicators'
  );

  const handleLoginSuccess = (newToken, user) => {
    setToken(newToken);
    setUsername(user.username);
    setRole(user.role);
    setUserId(user.id);
    setCurrentScreen('portal');
  };

  const handleLogout = () => {
    localStorage.removeItem('epq_token');
    localStorage.removeItem('epq_username');
    localStorage.removeItem('epq_role');
    localStorage.removeItem('epq_user_id');
    setToken(null);
    setUsername(null);
    setRole(null);
    setUserId(null);
    setCurrentScreen('public-indicators');
  };

  const handleBackToIndicators = () => {
    setCurrentScreen('public-indicators');
  };

  const handleNavigateToLogin = () => {
    setCurrentScreen('login');
  };

  if (currentScreen === 'public-indicators') {
    return (
      <div className="public-view-container">
        <PublicHeader onNavigateToLogin={handleNavigateToLogin} />
        <main className="public-main-content">
          <IndicatorsDashboard token={null} onUnauthorized={handleLogout} />
        </main>
      </div>
    );
  }

  if (currentScreen === 'login') {
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onBack={handleBackToIndicators}
      />
    );
  }

  return (
    <AppLayout
      token={token}
      username={username}
      role={role}
      userId={userId}
      onLogout={handleLogout}
    />
  );
}

export default App;
