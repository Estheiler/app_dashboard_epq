import React, { useState, useEffect } from 'react';
import './RegistroLecturaPage.css';

function RegistroLecturaPage({ token, currentUsername, currentRole, currentUserId, onBack }) {
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState(1);
  const [lecturaM3, setLecturaM3] = useState('');
  const [observaciones, setObservaciones] = useState('');

  // Estados de carga y mensajes
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [readingsLoading, setReadingsLoading] = useState(false);

  // Estados de edición y CRUD (Administradores)
  const [allReadings, setAllReadings] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);

  const apiBaseUrl = import.meta.env.VITE_API_URL || '';
  const isOperario = currentRole?.toLowerCase() === 'operario';

  // Inicializar fecha local al cargar
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    setFecha(`${year}-${month}-${day}`);
  }, []);

  // Cargar las últimas lecturas
  const fetchRecentReadings = async () => {
    try {
      setReadingsLoading(true);
      const response = await fetch(`${apiBaseUrl}/registro-macromedidor`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('No se pudieron cargar las lecturas.');
      }

      const result = await response.json();
      let data = result.data || [];

      // Ordenar cronológicamente descendente por fecha y hora
      const sorted = data.sort((a, b) => {
        const dateA = new Date(`${a.fecha}T${a.hora.toString().padStart(2, '0')}:00:00`);
        const dateB = new Date(`${b.fecha}T${b.hora.toString().padStart(2, '0')}:00:00`);
        return dateB - dateA;
      });

      setAllReadings(sorted);
    } catch (err) {
      console.error('Error cargando lecturas:', err);
    } finally {
      setReadingsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchRecentReadings();
    }
  }, [token]);

  const handleEditSelect = (row) => {
    setIsEditing(true);
    setEditingId(row.id);
    setFecha(row.fecha);
    setHora(row.hora);
    setLecturaM3(row.lectura_m3 !== undefined ? row.lectura_m3 : (row.lectura || ''));
    setObservaciones(row.observaciones || '');
    setSuccessMessage('');
    setErrorMessage('');
    setShowFormModal(true);

    // Focus in on the input
    setTimeout(() => {
      document.getElementById('lectura')?.focus();
    }, 100);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    setLecturaM3('');
    setObservaciones('');
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    setFecha(`${year}-${month}-${day}`);
    setHora(1);
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleDeleteConfirm = async (id) => {
    setSuccessMessage('');
    setErrorMessage('');
    try {
      setLoading(true);
      const response = await fetch(`${apiBaseUrl}/registro-macromedidor/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al eliminar la lectura.');
      }

      setSuccessMessage('Lectura eliminada y consumos recalculados exitosamente.');
      setDeleteConfirmId(null);

      if (editingId === id) {
        handleCancelEdit();
      }

      fetchRecentReadings();
    } catch (err) {
      setErrorMessage(err.message || 'Error de conexión.');
      setDeleteConfirmId(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    // Validaciones
    if (!fecha) {
      setErrorMessage('Por favor, selecciona una fecha.');
      return;
    }

    const horaInt = parseInt(hora, 10);
    if (isNaN(horaInt) || horaInt < 1 || horaInt > 24) {
      setErrorMessage('La hora debe ser un número entero entre 1 y 24.');
      return;
    }

    const lecturaFloat = parseFloat(lecturaM3);
    if (isNaN(lecturaFloat) || lecturaFloat < 0) {
      setErrorMessage('La lectura en m³ debe ser un número positivo.');
      return;
    }

    try {
      setLoading(true);

      if (isEditing) {
        // ACTUALIZACIÓN con fallback
        const updatePayload = {
          lectura_m3: lecturaFloat,
          observaciones: observaciones.trim() || undefined
        };

        try {
          const response = await fetch(`${apiBaseUrl}/registro-macromedidor/${editingId}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatePayload),
          });

          // Fallback para DELETE + POST si PATCH responde 404 o 405
          if (response.status === 404 || response.status === 405) {
            console.warn(`PATCH no soportado (Status ${response.status}). Aplicando fallback DELETE + POST.`);

            // Paso 1: Eliminar registro viejo
            const deleteResponse = await fetch(`${apiBaseUrl}/registro-macromedidor/${editingId}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              }
            });

            if (!deleteResponse.ok) {
              const delResult = await deleteResponse.json().catch(() => ({}));
              throw new Error(delResult.message || 'Error al eliminar el registro anterior en fallback.');
            }

            // Paso 2: Crear el nuevo registro (en fallback sí enviamos fecha/hora original para recrearlo)
            const createPayload = {
              fecha,
              hora: horaInt,
              lectura_m3: lecturaFloat,
              observaciones: observaciones.trim() || undefined
            };

            const createResponse = await fetch(`${apiBaseUrl}/registro-macromedidor`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(createPayload)
            });

            const createResult = await createResponse.json();
            if (createResponse.status === 409) {
              throw new Error('Ya existe una lectura registrada para la nueva fecha y hora.');
            }

            if (!createResponse.ok) {
              throw new Error(createResult.message || 'Error al recrear la lectura de macromedición en fallback.');
            }

            setSuccessMessage('Lectura actualizada correctamente.');
            fetchRecentReadings();
            setTimeout(() => {
              setShowFormModal(false);
              handleCancelEdit();
            }, 1500);
            return;
          }

          const result = await response.json();

          if (response.status === 409) {
            setErrorMessage('Ya existe una lectura registrada para esta fecha y hora.');
            return;
          }

          if (!response.ok) {
            throw new Error(result.message || 'Error al actualizar la lectura.');
          }

          setSuccessMessage('Lectura actualizada correctamente.');
          fetchRecentReadings();
          setTimeout(() => {
            setShowFormModal(false);
            handleCancelEdit();
          }, 1500);
        } catch (err) {
          setErrorMessage(err.message || 'Error al actualizar la lectura.');
        }
      } else {
        // CREACIÓN
        const createPayload = {
          fecha,
          hora: horaInt,
          lectura_m3: lecturaFloat,
          observaciones: observaciones.trim() || undefined
        };

        const response = await fetch(`${apiBaseUrl}/registro-macromedidor`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(createPayload),
        });

        const result = await response.json();

        if (response.status === 409) {
          setErrorMessage('Ya existe una lectura registrada para esta fecha y hora.');
          return;
        }

        if (!response.ok) {
          throw new Error(result.message || 'Error al guardar la lectura de macromedición.');
        }

        // Éxito
        setSuccessMessage(`Lectura registrada correctamente para la hora ${horaInt}.`);
        setLecturaM3('');
        setObservaciones('');

        // Sugerir la siguiente hora
        if (horaInt < 24) {
          setHora(horaInt + 1);
        } else {
          setHora(1);
        }

        fetchRecentReadings();
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined) return '-';
    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 2
    }).format(num);
  };

  // Filtrar lecturas basado en la búsqueda por fecha
  const filteredReadings = allReadings.filter(row => {
    if (!searchQuery) return true;
    return row.fecha.includes(searchQuery);
  });

  // Paginación local
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredReadings.length / itemsPerPage);
  const paginatedReadings = filteredReadings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="registro-lectura-container">
      {/* Cabecera Interna */}
      <div className="module-inner-header">
        <div className="module-header-info">
          <div className="back-nav-container">
            <button className="back-link-btn" onClick={onBack}>
              &larr; Volver al menú
            </button>
          </div>
          <h2 className="module-inner-title">Registro de Lectura de Macromedición</h2>
          <p className="module-inner-description">
            El operario puede registrar la lectura hora a hora del macromedidor de Ciudadela MIA.
          </p>
        </div>
        <div className="module-header-actions">
          <span className="location-badge">📍 Ciudadela MIA</span>
        </div>
      </div>

      {/* Tabla de Historial / CRUD */}
      <div className="history-card">
        {/* Modal / Overlay de Confirmación de Eliminación */}
        {deleteConfirmId && (
          <div className="delete-confirm-overlay">
            <h4 className="delete-confirm-title">¿Eliminar lectura?</h4>
            <p className="delete-confirm-text">
              Esta acción es irreversible y recalculará automáticamente los consumos acumulados posteriores.
            </p>
            <div className="delete-confirm-actions">
              <button 
                type="button" 
                className="btn-confirm-delete" 
                onClick={() => handleDeleteConfirm(deleteConfirmId)}
                disabled={loading}
              >
                {loading ? 'Eliminando...' : 'Confirmar'}
              </button>
              <button 
                type="button" 
                className="btn-cancel-delete" 
                onClick={() => setDeleteConfirmId(null)}
                disabled={loading}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div className="card-header-simple" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="card-section-title">
            {isOperario ? 'Historial de lecturas' : 'Historial de lecturas (Administrador)'}
          </h3>
          <button 
            type="button" 
            className="add-reading-btn" 
            onClick={() => {
              setShowFormModal(true);
              setIsEditing(false);
              setSuccessMessage('');
              setErrorMessage('');
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Agregar Lectura
          </button>
        </div>

        <div className="crud-filter-bar" style={{ padding: '0 16px', marginBottom: '8px' }}>
          <input
            type="text"
            placeholder="Buscar por fecha (AAAA-MM-DD)..."
            className="crud-search-input"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="history-table-wrapper">
          {readingsLoading ? (
            <div className="table-placeholder">
              <span className="spinner-sm"></span>
              <span>Cargando historial...</span>
            </div>
          ) : filteredReadings.length === 0 ? (
            <div className="table-placeholder empty">
              <span>No se encontraron lecturas registradas.</span>
            </div>
          ) : (
            <table className="compact-macro-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Lectura</th>
                  <th>Consumo</th>
                  <th>Registrado Por</th>
                  <th className="actions-th">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedReadings.map((row) => {
                  const lectura = parseFloat(row.lectura_m3) || parseFloat(row.lectura) || 0;
                  const consumo = parseFloat(row.consolidado_m3) || parseFloat(row.consolidado) || 0;
                  const creador = row.createdByUser?.username || 'Sistema';

                  return (
                    <tr key={row.id}>
                      <td>{row.fecha}</td>
                      <td className="td-bold">{`${row.hora.toString().padStart(2, '0')}:00`}</td>
                      <td>{formatNumber(lectura)}</td>
                      <td className="text-primary font-bold">{formatNumber(consumo)}</td>
                      <td className="td-italic" style={{ color: 'var(--text-secondary)' }}>{creador}</td>
                      <td className="actions-td">
                        <div className="action-buttons-cell">
                          {(!isOperario || row.createdBy === currentUserId || row.createdByUser?.id === currentUserId) && (
                            <button
                              type="button"
                              className="btn-row-action edit-btn"
                              title="Editar registro"
                              onClick={() => handleEditSelect(row)}
                              disabled={loading}
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 20h9"></path>
                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                              </svg>
                            </button>
                          )}
                          {!isOperario && (
                            <button
                              type="button"
                              className="btn-row-action delete-btn"
                              title="Eliminar registro"
                              onClick={() => setDeleteConfirmId(row.id)}
                              disabled={loading}
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="table-pagination" style={{ margin: '12px 16px' }}>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              &larr; Anterior
            </button>
            <span className="pagination-info">
              Página <strong>{currentPage}</strong> de {totalPages}
            </span>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Siguiente &rarr;
            </button>
          </div>
        )}

        <div className="history-card-footer">
          <p className="helper-text">
            * El consumo (m³/h) es calculado automáticamente por el backend.
          </p>
        </div>
      </div>

      {/* MODAL: REGISTRAR / EDITAR LECTURA */}
      {showFormModal && (
        <div className="modal-backdrop">
          <div className="modal-content-card" style={{ maxWidth: '500px', width: '100%' }}>
            <div className="modal-card-header">
              <h3 className="modal-card-title">
                {isEditing ? 'Editar Lectura' : 'Nueva Lectura'}
              </h3>
              <button 
                type="button" 
                className="modal-close-btn" 
                onClick={() => {
                  setShowFormModal(false);
                  handleCancelEdit();
                }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              {successMessage && <div className="feedback-message success-alert" style={{ marginBottom: '16px' }}>{successMessage}</div>}
              {errorMessage && <div className="feedback-message error-alert" style={{ marginBottom: '16px' }}>{errorMessage}</div>}

              <div className="form-row-grid">
                <div className="form-group">
                  <label htmlFor="fecha">Fecha</label>
                  <input
                    type="date"
                    id="fecha"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    required
                    disabled={loading || isEditing}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="hora">Hora (1 - 24)</label>
                  <input
                    type="number"
                    id="hora"
                    min="1"
                    max="24"
                    value={hora}
                    onChange={(e) => setHora(e.target.value)}
                    required
                    disabled={loading || isEditing}
                    placeholder="Ej: 14"
                  />
                  <span className="input-helper">Formato de 1 a 24 horas</span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="lectura">Lectura (m³)</label>
                <input
                  type="number"
                  step="any"
                  id="lectura"
                  value={lecturaM3}
                  onChange={(e) => setLecturaM3(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Ingresa la lectura en m³"
                />
                <span className="input-helper">Ej: 12450.80</span>
              </div>

              <div className="form-group">
                <label htmlFor="observaciones">Observaciones (Opcional)</label>
                <textarea
                  id="observaciones"
                  rows="3"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  disabled={loading}
                  placeholder="Indica si hay novedades en la lectura o el macromedidor..."
                ></textarea>
              </div>

              <div className="modal-card-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setShowFormModal(false);
                    handleCancelEdit();
                  }}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-confirm" disabled={loading}>
                  {loading ? (
                    <span className="loading-btn-content">
                      <span className="spinner-sm"></span>
                      Procesando...
                    </span>
                  ) : (
                    isEditing ? 'Guardar Cambios' : 'Registrar Lectura'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RegistroLecturaPage;
