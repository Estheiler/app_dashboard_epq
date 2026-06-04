import React, { useState, useEffect } from 'react';

function UserManagement({ token, currentUsername, currentRole, onUnauthorized }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para búsqueda y filtrado
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Estados de Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Estados de los Formularios
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'operario' });
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // Feedback del Servidor
  const [feedback, setFeedback] = useState({ text: '', type: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const apiBaseUrl = import.meta.env.VITE_API_URL || '';

  // Cargar lista de usuarios
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${apiBaseUrl}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        if (onUnauthorized) onUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error('No se pudo cargar la lista de usuarios del servidor.');
      }

      const result = await response.json();
      setUsers(result.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  // Mostrar mensaje de feedback temporal
  const showFeedback = (text, type = 'success') => {
    setFeedback({ text, type });
    setTimeout(() => {
      setFeedback({ text: '', type: '' });
    }, 4000);
  };

  // Crear nuevo usuario
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUser.username.trim() || !newUser.password.trim()) {
      showFeedback('Por favor, completa todos los campos obligatorios.', 'error');
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch(`${apiBaseUrl}/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: newUser.username.trim(),
          password: newUser.password,
          role: newUser.role
        })
      });

      const result = await response.json();

      if (response.status === 401) {
        if (onUnauthorized) onUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(result.message || 'Error al crear el usuario.');
      }

      showFeedback('Usuario creado exitosamente.');
      setShowCreateModal(false);
      setNewUser({ username: '', password: '', role: 'operario' });
      fetchUsers();
    } catch (err) {
      showFeedback(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Actualizar Username
  const handleUpdateUsername = async (e) => {
    e.preventDefault();
    if (!newUsername.trim()) {
      showFeedback('El nombre de usuario no puede estar vacío.', 'error');
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch(`${apiBaseUrl}/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: newUsername.trim()
        })
      });

      const result = await response.json();

      if (response.status === 401) {
        if (onUnauthorized) onUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(result.message || 'Error al actualizar el nombre de usuario.');
      }

      showFeedback('Nombre de usuario actualizado con éxito.');
      setShowEditModal(false);
      setSelectedUser(null);
      setNewUsername('');
      fetchUsers();
    } catch (err) {
      showFeedback(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Cambiar Rol
  const handleUpdateRole = async (userId, roleValue) => {
    try {
      const response = await fetch(`${apiBaseUrl}/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          role: roleValue
        })
      });

      const result = await response.json();

      if (response.status === 401) {
        if (onUnauthorized) onUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(result.message || 'Error al actualizar el rol.');
      }

      showFeedback('Rol actualizado exitosamente.');
      fetchUsers();
    } catch (err) {
      showFeedback(err.message, 'error');
    }
  };

  // Cambiar Estado (Activar/Desactivar)
  const handleToggleActive = async (user) => {
    if (user.username === currentUsername) {
      showFeedback('No puedes desactivar tu propia cuenta activa.', 'error');
      return;
    }

    const endpoint = user.isActive ? 'deactivate' : 'activate';
    try {
      const response = await fetch(`${apiBaseUrl}/users/${user.id}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (response.status === 401) {
        if (onUnauthorized) onUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(result.message || `Error al cambiar estado a ${endpoint}.`);
      }

      showFeedback(`Usuario ${user.isActive ? 'desactivado' : 'activado'} exitosamente.`);
      fetchUsers();
    } catch (err) {
      showFeedback(err.message, 'error');
    }
  };

  // Restablecer Contraseña
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 4) {
      showFeedback('La contraseña debe tener al menos 4 caracteres.', 'error');
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch(`${apiBaseUrl}/users/${selectedUser.id}/reset-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: newPassword
        })
      });

      const result = await response.json();

      if (response.status === 401) {
        if (onUnauthorized) onUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(result.message || 'Error al restablecer contraseña.');
      }

      showFeedback('Contraseña restablecida exitosamente.');
      setShowResetModal(false);
      setSelectedUser(null);
      setNewPassword('');
    } catch (err) {
      showFeedback(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Eliminar Usuario
  const handleDeleteUser = async () => {
    if (selectedUser.username === currentUsername) {
      showFeedback('No puedes eliminar tu propia cuenta activa.', 'error');
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch(`${apiBaseUrl}/users/${selectedUser.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (response.status === 401) {
        if (onUnauthorized) onUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(result.message || 'Error al eliminar el usuario.');
      }

      showFeedback('Usuario eliminado correctamente de la plataforma.');
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      showFeedback(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Abrir Modal de Edición
  const openEditModal = (user) => {
    setSelectedUser(user);
    setNewUsername(user.username);
    setShowEditModal(true);
  };

  // Abrir Modal de Password Reset
  const openResetModal = (user) => {
    setSelectedUser(user);
    setShowResetModal(true);
  };

  // Abrir Modal de Confirmación de Borrado
  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  // Filtrado local de usuarios
  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeClass = (r) => {
    if (!r) return 'badge-role';
    const upper = r.toUpperCase();
    if (upper === 'SUPERADMIN') return 'badge-role superadmin';
    if (upper === 'ADMIN') return 'badge-role admin';
    if (upper === 'HIDRAULICO') return 'badge-role hidraulico';
    return 'badge-role operario';
  };

  const getRoleName = (r) => {
    if (!r) return '';
    const upper = r.toUpperCase();
    if (upper === 'SUPERADMIN') return 'Super Admin';
    if (upper === 'ADMIN') return 'Administrador';
    if (upper === 'HIDRAULICO') return 'Hidráulico';
    return 'Operario';
  };

  return (
    <div className="user-management-view">
      {/* Cabecera Interna */}
      <div className="module-inner-header">
        <div className="module-header-info">
          <h2 className="module-inner-title">Módulo de Gestión de Usuarios</h2>
          <p className="module-inner-description">Crea, edita, desactiva y administra cuentas del personal operativo</p>
        </div>
        <div className="module-header-actions">
          <button className="add-user-btn" onClick={() => setShowCreateModal(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Banner de Feedback flotante/fijo */}
      {feedback.text && (
        <div className={`global-feedback ${feedback.type === 'error' ? 'error' : 'success'}`}>
          {feedback.text}
        </div>
      )}

      {/* Caja de Filtros */}
      <div className="management-filter-box">
        <div className="filter-search-wrapper">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            className="filter-search-input"
            placeholder="Buscar por nombre de usuario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-select-wrapper">
          <label htmlFor="role-filter">Filtrar Rol</label>
          <select
            id="role-filter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">Todos los Roles</option>
            {currentRole?.toUpperCase() === 'SUPERADMIN' && <option value="superadmin">Super Admin</option>}
            {currentRole?.toUpperCase() === 'SUPERADMIN' && <option value="admin">Administradores</option>}
            <option value="hidraulico">Hidráulicos</option>
            <option value="operario">Operarios</option>
          </select>
        </div>
      </div>

      {/* Contenedor Principal (Tabla) */}
      <div className="users-table-container">
        {loading ? (
          <div className="table-loading-screen">
            <div className="loading-spinner"></div>
            <div>Cargando listado de usuarios...</div>
          </div>
        ) : error ? (
          <div className="table-error-screen">
            <span>⚠️</span> {error}
            <button className="error-retry-btn" onClick={fetchUsers}>Reintentar</button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="table-empty-screen">
            No se encontraron usuarios registrados {searchTerm || roleFilter !== 'all' ? 'que coincidan con la búsqueda' : ''}.
          </div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Fijar Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="td-username">
                    <span className="username-text">{user.username}</span>
                    {user.username === currentUsername && <span className="current-user-tag">Tú</span>}
                  </td>
                  <td>
                    <span className={getRoleBadgeClass(user.role)}>
                      {getRoleName(user.role)}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`status-toggle-btn ${user.isActive ? 'active' : 'inactive'}`}
                      onClick={() => handleToggleActive(user)}
                      disabled={user.username === currentUsername}
                      title={user.username === currentUsername ? 'No puedes desactivarte a ti mismo' : `Cambiar a ${user.isActive ? 'Inactivo' : 'Activo'}`}
                    >
                      <span className="toggle-dot"></span>
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td>
                    <select
                      className="inline-role-select"
                      value={user.role}
                      onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                      disabled={
                        user.username === currentUsername ||
                        (currentRole?.toLowerCase() === 'admin' && (user.role?.toLowerCase() === 'admin' || user.role?.toLowerCase() === 'superadmin'))
                      }
                    >
                      {currentRole?.toLowerCase() === 'superadmin' && <option value="superadmin">Super Admin</option>}
                      {currentRole?.toLowerCase() === 'superadmin' && <option value="admin">Administrador</option>}
                      <option value="hidraulico">Hidráulico</option>
                      <option value="operario">Operario</option>
                    </select>
                  </td>
                  <td className="td-actions">
                    <button
                      className="action-icon-btn edit"
                      onClick={() => openEditModal(user)}
                      title="Editar nombre de usuario"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"></path>
                      </svg>
                    </button>
                    <button
                      className="action-icon-btn key"
                      onClick={() => openResetModal(user)}
                      title="Restablecer contraseña"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                    </button>
                    <button
                      className="action-icon-btn delete"
                      onClick={() => openDeleteModal(user)}
                      disabled={user.username === currentUsername}
                      title={user.username === currentUsername ? 'No puedes eliminarte a ti mismo' : 'Eliminar usuario'}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL 1: CREAR USUARIO */}
      {showCreateModal && (
        <div className="modal-backdrop">
          <div className="modal-content-card">
            <div className="modal-card-header">
              <h3 className="modal-card-title">Registrar Nuevo Usuario</h3>
              <button className="modal-close-btn" onClick={() => setShowCreateModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateUser} className="modal-form">
              <div className="form-group">
                <label htmlFor="modal-create-username">Nombre de Usuario *</label>
                <input
                  type="text"
                  id="modal-create-username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  placeholder="Ej: operario_sur"
                  disabled={actionLoading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="modal-create-password">Contraseña *</label>
                <input
                  type="password"
                  id="modal-create-password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Mínimo 4 caracteres"
                  disabled={actionLoading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="modal-create-role">Rol *</label>
                <select
                  id="modal-create-role"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  disabled={actionLoading}
                >
                  {currentRole?.toLowerCase() === 'superadmin' && <option value="superadmin">Super Admin</option>}
                  {currentRole?.toLowerCase() === 'superadmin' && <option value="admin">Administrador</option>}
                  <option value="hidraulico">Hidráulico</option>
                  <option value="operario">Operario</option>
                </select>
              </div>

              <div className="modal-card-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowCreateModal(false)} disabled={actionLoading}>
                  Cancelar
                </button>
                <button type="submit" className="btn-confirm" disabled={actionLoading}>
                  {actionLoading ? 'Registrando...' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDITAR NOMBRE DE USUARIO */}
      {showEditModal && selectedUser && (
        <div className="modal-backdrop">
          <div className="modal-content-card">
            <div className="modal-card-header">
              <h3 className="modal-card-title">Editar Nombre de Usuario</h3>
              <button className="modal-close-btn" onClick={() => setShowEditModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleUpdateUsername} className="modal-form">
              <div className="form-group">
                <label htmlFor="modal-edit-username">Nombre de Usuario *</label>
                <input
                  type="text"
                  id="modal-edit-username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Ej: nuevo_operario"
                  disabled={actionLoading}
                  required
                />
              </div>

              <div className="modal-card-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowEditModal(false)} disabled={actionLoading}>
                  Cancelar
                </button>
                <button type="submit" className="btn-confirm" disabled={actionLoading}>
                  {actionLoading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RESTABLECER CONTRASEÑA */}
      {showResetModal && selectedUser && (
        <div className="modal-backdrop">
          <div className="modal-content-card">
            <div className="modal-card-header">
              <h3 className="modal-card-title">Restablecer Contraseña</h3>
              <button className="modal-close-btn" onClick={() => setShowResetModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleResetPassword} className="modal-form">
              <div className="modal-user-info">
                Establecer nueva clave para: <strong>{selectedUser.username}</strong>
              </div>
              <div className="form-group">
                <label htmlFor="modal-reset-password">Nueva Contraseña *</label>
                <input
                  type="password"
                  id="modal-reset-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 4 caracteres"
                  disabled={actionLoading}
                  required
                />
              </div>

              <div className="modal-card-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowResetModal(false)} disabled={actionLoading}>
                  Cancelar
                </button>
                <button type="submit" className="btn-confirm" disabled={actionLoading}>
                  {actionLoading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CONFIRMACIÓN DE ELIMINAR */}
      {showDeleteModal && selectedUser && (
        <div className="modal-backdrop">
          <div className="modal-content-card border-danger">
            <div className="modal-card-header">
              <h3 className="modal-card-title text-danger">⚠️ Confirmar Eliminación</h3>
              <button className="modal-close-btn" onClick={() => setShowDeleteModal(false)}>&times;</button>
            </div>
            <div className="modal-body-content">
              <p>¿Estás seguro de que deseas eliminar permanentemente al usuario <strong>{selectedUser.username}</strong>?</p>
              <p className="text-danger-sub">Esta acción realiza un borrado lógico del sistema y no podrá deshacerse de forma directa.</p>
            </div>
            <div className="modal-card-actions">
              <button type="button" className="btn-cancel" onClick={() => setShowDeleteModal(false)} disabled={actionLoading}>
                Cancelar
              </button>
              <button type="button" className="btn-confirm btn-danger" onClick={handleDeleteUser} disabled={actionLoading}>
                {actionLoading ? 'Eliminando...' : 'Sí, Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;
