import React, { useState, useEffect } from 'react';

function RegistroLecturaPage({ token, currentUsername, currentRole, currentUserId, onBack }) {
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState(1);
  const [lecturaM3, setLecturaM3] = useState('');
  const [observaciones, setObservaciones] = useState('');
  
  // Estados de carga y mensajes
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Estado para la tabla de últimas lecturas
  const [recentReadings, setRecentReadings] = useState([]);
  const [readingsLoading, setReadingsLoading] = useState(false);

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
        throw new Error('No se pudieron cargar las lecturas recientes.');
      }

      const result = await response.json();
      let data = result.data || [];

      // Filtro adicional de seguridad en frontend para OPERARIO
      if (isOperario) {
        data = data.filter(r => 
          String(r.operario_id) === String(currentUserId) || 
          String(r.createdBy) === String(currentUserId)
        );
      }

      // Ordenar cronológicamente descendente por fecha y hora
      const sorted = data.sort((a, b) => {
        const dateA = new Date(`${a.fecha}T${a.hora.toString().padStart(2, '0')}:00:00`);
        const dateB = new Date(`${b.fecha}T${b.hora.toString().padStart(2, '0')}:00:00`);
        return dateB - dateA;
      });

      // Tomar solo las últimas 5 lecturas
      setRecentReadings(sorted.slice(0, 5));
    } catch (err) {
      console.error('Error cargando lecturas recientes:', err);
    } finally {
      setReadingsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchRecentReadings();
    }
  }, [token]);

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
      
      const payload = {
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
        body: JSON.stringify(payload),
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
        // Si es la hora 24, sugerir hora 1 (para que el operario cambie de fecha manualmente o continúe)
        setHora(1);
      }

      // Actualizar la lista de lecturas recientes
      fetchRecentReadings();

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

      <div className="registro-lectura-grid">
        {/* Formulario */}
        <div className="form-card">
          <div className="card-header-simple">
            <h3 className="card-section-title">Nueva Lectura</h3>
          </div>

          <form onSubmit={handleSubmit} className="macro-form">
            {successMessage && <div className="feedback-message success-alert">{successMessage}</div>}
            {errorMessage && <div className="feedback-message error-alert">{errorMessage}</div>}

            <div className="form-row-grid">
              <div className="form-group">
                <label htmlFor="fecha">Fecha</label>
                <input
                  type="date"
                  id="fecha"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  required
                  disabled={loading}
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
                  disabled={loading}
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
                placeholder="Ingresa la lectura acumulada en m³"
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

            <button type="submit" className="submit-macro-btn" disabled={loading}>
              {loading ? (
                <span className="loading-btn-content">
                  <span className="spinner-sm"></span>
                  Registrando lectura...
                </span>
              ) : (
                'Registrar Lectura'
              )}
            </button>
          </form>
        </div>

        {/* Tabla de Apoyo */}
        <div className="history-card">
          <div className="card-header-simple">
            <h3 className="card-section-title">
              {isOperario ? 'Mis últimas lecturas registradas' : 'Últimas lecturas registradas'}
            </h3>
          </div>

          <div className="history-table-wrapper">
            {readingsLoading ? (
              <div className="table-placeholder">
                <span className="spinner-sm"></span>
                <span>Cargando historial...</span>
              </div>
            ) : recentReadings.length === 0 ? (
              <div className="table-placeholder empty">
                <span>No tienes lecturas registradas recientemente.</span>
              </div>
            ) : (
              <table className="compact-macro-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Lectura</th>
                    <th>Consumo</th>
                    <th>Acum. Día</th>
                  </tr>
                </thead>
                <tbody>
                  {recentReadings.map((row) => {
                    const lectura = parseFloat(row.lectura_m3) || parseFloat(row.lectura) || 0;
                    const consumo = parseFloat(row.consolidado_m3) || parseFloat(row.consolidado) || 0;
                    const acumulado = parseFloat(row.consumo_acumulado_dia) || parseFloat(row.acumulado) || 0;

                    return (
                      <tr key={row.id}>
                        <td>{row.fecha}</td>
                        <td className="td-bold">{`${row.hora.toString().padStart(2, '0')}:00`}</td>
                        <td>{formatNumber(lectura)}</td>
                        <td className="text-primary font-bold">{formatNumber(consumo)}</td>
                        <td>{formatNumber(acumulado)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
          <div className="history-card-footer">
            <p className="helper-text">
              * El consumo y el acumulado diario son calculados automáticamente por el backend.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegistroLecturaPage;
