import React, { useState } from 'react';
import Login from './components/Login';
import AppLayout from './components/AppLayout';

function App() {
  const [token, setToken] = useState(localStorage.getItem('epq_token'));
  const [username, setUsername] = useState(localStorage.getItem('epq_username'));
  const [role, setRole] = useState(localStorage.getItem('epq_role'));

  const handleLoginSuccess = (newToken, user) => {
    setToken(newToken);
    setUsername(user.username);
    setRole(user.role);
  };

  const handleLogout = () => {
    localStorage.removeItem('epq_token');
    localStorage.removeItem('epq_username');
    localStorage.removeItem('epq_role');
    setToken(null);
    setUsername(null);
    setRole(null);
  };

  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <AppLayout
      token={token}
      username={username}
      role={role}
      onLogout={handleLogout}
    />
  );
}

export default App;
