import React, { useState, useEffect } from 'react';
import './AuditLogPage.css';

function AuditLogPage({ token, currentUsername, currentRole, onUnauthorized }) {
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'access'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Datos
  const [userLogs, setUserLogs] = useState([]);
  const [accessLogs, setAccessLogs] = useState([]);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 12;

  const apiBaseUrl = import.meta.env.VITE_API_URL || '';

  // Cargar datos basados en la pestaña activa
  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const endpoint = activeTab === 'users' ? '/auditoria/usuarios' : '/auditoria/accesos';
      const response = await fetch(`${apiBaseUrl}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        if (onUnauthorized) onUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error('No se pudo cargar la bitácora de auditoría del servidor.');
      }

      const result = await response.json();
      const rawData = result.data || [];
      
      // Ordenar por fecha descendente (más recientes primero)
      const sorted = rawData.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

      if (activeTab === 'users') {
        setUserLogs(sorted);
      } else {
        setAccessLogs(sorted);
      }
      
      // Resetear paginación y filtros al cambiar de pestaña
      setCurrentPage(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchLogs();
    }
  }, [activeTab, token]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchTerm('');
    setActionFilter('ALL');
  };

  // Filtrar los datos en el cliente
  const getFilteredLogs = () => {
    const logs = activeTab === 'users' ? userLogs : accessLogs;
    return logs.filter(log => {
      // Filtro de búsqueda por texto
      const textToSearch = activeTab === 'users'
        ? `${log.ejecutorUsername || ''} ${log.usuarioAfectadoUsername || ''} ${log.detalles || ''} ${log.accion || ''}`.toLowerCase()
        : `${log.username || ''} ${log.ip || ''} ${log.userAgent || ''} ${log.detalles || ''} ${log.accion || ''}`.toLowerCase();
      
      const matchesSearch = textToSearch.includes(searchTerm.toLowerCase());
      
      // Filtro por tipo de acción
      const matchesAction = actionFilter === 'ALL' || log.accion === actionFilter;
      
      return matchesSearch && matchesAction;
    });
  };

  const filteredLogs = getFilteredLogs();

  // Paginación
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Formatear Fecha/Hora
  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleString('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  // Traducir Acciones a etiquetas legibles y clases CSS
  const getActionBadgeClass = (action) => {
    const act = action?.toUpperCase();
    if (act === 'CREACION' || act === 'LOGIN_EXITOSO' || act === 'ACTIVACION') {
      return 'badge-audit success';
    }
    if (act === 'ELIMINACION' || act === 'LOGIN_FALLIDO' || act === 'DESACTIVACION') {
      return 'badge-audit danger';
    }
    if (act === 'MODIFICACION' || act === 'LOGOUT' || act === 'RESET_PASSWORD') {
      return 'badge-audit warning';
    }
    return 'badge-audit info';
  };

  const getActionLabel = (action) => {
    const act = action?.toUpperCase();
    switch (act) {
      case 'CREACION': return 'Creación';
      case 'MODIFICACION': return 'Modificación';
      case 'ELIMINACION': return 'Eliminación';
      case 'ACTIVACION': return 'Activación';
      case 'DESACTIVACION': return 'Desactivación';
      case 'RESET_PASSWORD': return 'Reseteo Clave';
      case 'CAMBIO_ROL': return 'Cambio Rol';
      case 'LOGIN_EXITOSO': return 'Login Exitoso';
      case 'LOGIN_FALLIDO': return 'Login Fallido';
      case 'LOGOUT': return 'Cierre Sesión';
      case 'SESION_TERMINADA': return 'Sesión Terminada';
      default: return action;
    }
  };

  // Obtener opciones únicas de filtro de acción basado en la pestaña activa
  const getActionOptions = () => {
    const logs = activeTab === 'users' ? userLogs : accessLogs;
    const actions = [...new Set(logs.map(log => log.accion))];
    return actions.map(act => ({ value: act, label: getActionLabel(act) }));
  };

  // Parsear User Agent para mostrarlo simplificado
  const simplifyUserAgent = (ua) => {
    if (!ua) return 'Desconocido';
    const lower = ua.toLowerCase();
    
    // SO
    let os = 'OS Desconocido';
    if (lower.includes('windows')) os = 'Windows';
    else if (lower.includes('macintosh') || lower.includes('mac os')) os = 'macOS';
    else if (lower.includes('android')) os = 'Android';
    else if (lower.includes('iphone') || lower.includes('ipad')) os = 'iOS';
    else if (lower.includes('linux')) os = 'Linux';
    
    // Navegador
    let browser = 'Browser';
    if (lower.includes('edg/')) browser = 'Edge';
    else if (lower.includes('chrome/')) browser = 'Chrome';
    else if (lower.includes('safari/') && !lower.includes('chrome')) browser = 'Safari';
    else if (lower.includes('firefox/')) browser = 'Firefox';
    else if (lower.includes('opera/') || lower.includes('opr/')) browser = 'Opera';
    
    return `${browser} (${os})`;
  };

  return (
    <div className="audit-page-wrapper">
      {/* Cabecera del Módulo */}
      <div className="module-inner-header">
        <div className="module-header-info">
          <h2 className="module-inner-title">Auditoría y Bitácora del Sistema</h2>
          <p className="module-inner-description">
            Registro histórico de seguridad, inicios de sesión y administración de usuarios en la plataforma.
          </p>
        </div>
        <div className="module-header-actions">
          <button className="sync-button" onClick={fetchLogs} title="Actualizar Bitácora" disabled={loading}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={loading ? 'spin' : ''}>
              <path d="M23 4v6h-6"></path>
              <path d="M1 20v-6h6"></path>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Pestañas de Navegación */}
      <div className="audit-tabs-container">
        <button
          className={`audit-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => handleTabChange('users')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="tab-icon">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          Acciones de Usuarios
        </button>
        <button
          className={`audit-tab-btn ${activeTab === 'access' ? 'active' : ''}`}
          onClick={() => handleTabChange('access')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="tab-icon">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
            <polyline points="10 17 15 12 10 7"></polyline>
            <line x1="15" y1="12" x2="3" y2="12"></line>
          </svg>
          Accesos y Logins
        </button>
      </div>

      {/* Barra de Filtros */}
      <div className="audit-filters-bar">
        <div className="search-input-container">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="search-icon">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder={activeTab === 'users' ? "Buscar por ejecutor, afectado o detalles..." : "Buscar por usuario, IP o navegador..."}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>

        <div className="filter-select-container">
          <select
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setCurrentPage(1); }}
            className="audit-select"
          >
            <option value="ALL">Todas las Acciones</option>
            {getActionOptions().map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla de Resultados */}
      <div className="audit-table-card">
        {loading ? (
          <div className="table-placeholder">
            <span className="spinner-sm" style={{ borderTopColor: 'var(--blue)', width: '32px', height: '32px' }}></span>
            <span>Cargando bitácora de auditoría...</span>
          </div>
        ) : error ? (
          <div className="table-placeholder error">
            <div className="error-icon" style={{ fontSize: '24px', color: 'var(--red)' }}>⚠️</div>
            <span>{error}</span>
            <button className="error-retry-btn" onClick={fetchLogs} style={{ marginTop: '10px' }}>Reintentar</button>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="table-placeholder empty">
            <span>No se encontraron registros en la bitácora que coincidan con los filtros aplicados.</span>
          </div>
        ) : (
          <>
            <div className="audit-table-wrapper">
              <table className="audit-table">
                <thead>
                  {activeTab === 'users' ? (
                    <tr>
                      <th>Fecha / Hora</th>
                      <th>Ejecutor</th>
                      <th>Acción</th>
                      <th>Usuario Afectado</th>
                      <th>Detalles</th>
                    </tr>
                  ) : (
                    <tr>
                      <th>Fecha / Hora</th>
                      <th>Usuario</th>
                      <th>Acción</th>
                      <th>Dirección IP</th>
                      <th>Dispositivo / OS</th>
                      <th>Detalles</th>
                    </tr>
                  )}
                </thead>
                <tbody>
                  {currentLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="td-date">{formatDateTime(log.fecha)}</td>
                      
                      {activeTab === 'users' ? (
                        <>
                          <td className="td-bold">{log.ejecutorUsername || `ID: ${log.ejecutorId}`}</td>
                          <td>
                            <span className={getActionBadgeClass(log.accion)}>
                              {getActionLabel(log.accion)}
                            </span>
                          </td>
                          <td className="td-bold">{log.usuarioAfectadoUsername || `ID: ${log.usuarioAfectadoId}`}</td>
                          <td className="td-details">{log.detalles || 'Sin detalles'}</td>
                        </>
                      ) : (
                        <>
                          <td className="td-bold">{log.username || 'Desconocido'}</td>
                          <td>
                            <span className={getActionBadgeClass(log.accion)}>
                              {getActionLabel(log.accion)}
                            </span>
                          </td>
                          <td className="td-ip">{log.ip || '-'}</td>
                          <td className="td-ua">{simplifyUserAgent(log.userAgent)}</td>
                          <td className="td-details">{log.detalles || 'Sin detalles'}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="table-pagination">
                <button
                  className="pagination-btn"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  &larr; Anterior
                </button>
                <span className="pagination-info">
                  Página <strong>{currentPage}</strong> de {totalPages}
                </span>
                <button
                  className="pagination-btn"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  Siguiente &rarr;
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default AuditLogPage;
