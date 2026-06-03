import React, { useState } from 'react';

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Por favor, ingresa el usuario y la contraseña.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const apiBaseUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Manejar errores de NestJS
        throw new Error(result.message || 'Credenciales inválidas.');
      }

      if (result.success && result.data?.access_token) {
        const token = result.data.access_token;
        const user = result.data.user;
        
        // Guardar en localStorage
        localStorage.setItem('epq_token', token);
        localStorage.setItem('epq_username', user.username);
        localStorage.setItem('epq_role', user.role);

        // Notificar al componente padre
        onLoginSuccess(token, user);
      } else {
        throw new Error('Respuesta del servidor inesperada.');
      }
    } catch (err) {
      setError(err.message || 'Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src="/logo_epq.png" alt="Logo EPQ" className="login-logo" />
          <h2 className="login-title">Dashboard EPQ</h2>
          <p className="login-subtitle">Indicadores Técnicos de Gestión</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="login-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="username">Usuario</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresa tu usuario"
              disabled={loading}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? (
              <span className="login-spinner-container">
                <span className="login-spinner"></span>
                Iniciando sesión...
              </span>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        <div className="login-footer">
          Empresas Públicas del Quindío S.A. E.S.P.
        </div>
      </div>
    </div>
  );
}

export default Login;
