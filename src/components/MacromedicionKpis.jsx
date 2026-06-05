import React from 'react';

function MacromedicionKpis({ data }) {
  // Inicialización de valores por defecto
  let latestReading = 0;
  let totalConsumo = 0;
  let avgConsumo = 0;
  let maxConsumo = 0;
  let maxConsumoHour = '-';
  let minConsumo = Infinity;
  let minConsumoHour = '-';
  const recordCount = data.length;

  if (recordCount > 0) {
    // 1. Obtener la lectura más reciente (ordenando por fecha y hora o usando created_at)
    // Para simplificar, asumimos que el primer registro tras ordenar por fecha y hora desc es el más reciente.
    const sortedByDate = [...data].sort((a, b) => {
      const dateA = new Date(`${a.fecha}T${a.hora.toString().padStart(2, '0')}:00:00`);
      const dateB = new Date(`${b.fecha}T${b.hora.toString().padStart(2, '0')}:00:00`);
      return dateB - dateA; // Descendente
    });
    
    latestReading = parseFloat(sortedByDate[0].lectura_m3) || parseFloat(sortedByDate[0].lectura) || 0;

    // 2. Cálculos generales
    data.forEach((r) => {
      const consumo = parseFloat(r.consolidado_m3) || parseFloat(r.consolidado) || 0;
      totalConsumo += consumo;

      if (consumo > maxConsumo) {
        maxConsumo = consumo;
        maxConsumoHour = `${r.hora.toString().padStart(2, '0')}:00`;
      }

      if (consumo < minConsumo) {
        minConsumo = consumo;
        minConsumoHour = `${r.hora.toString().padStart(2, '0')}:00`;
      }
    });

    avgConsumo = totalConsumo / recordCount;
    if (minConsumo === Infinity) {
      minConsumo = 0;
      minConsumoHour = '-';
    }
  } else {
    minConsumo = 0;
  }

  const formatNumber = (num) => {
    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 2
    }).format(num);
  };

  return (
    <div className="macromedicion-kpis-grid">
      {/* KPI 1: Lectura Reciente */}
      <div className="macro-kpi-card">
        <div className="macro-kpi-icon blue-theme">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <div className="macro-kpi-info">
          <span className="macro-kpi-label">Lectura Más Reciente</span>
          <span className="macro-kpi-value">{formatNumber(latestReading)} <span className="unit-label">m³</span></span>
          <span className="macro-kpi-subtext">Último valor registrado</span>
        </div>
      </div>

      {/* KPI 2: Consumo Total */}
      <div className="macro-kpi-card">
        <div className="macro-kpi-icon teal-theme">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        </div>
        <div className="macro-kpi-info">
          <span className="macro-kpi-label">Consumo Total Periodo</span>
          <span className="macro-kpi-value">{formatNumber(totalConsumo)} <span className="unit-label">m³</span></span>
          <span className="macro-kpi-subtext">Acumulado de {recordCount} registros</span>
        </div>
      </div>

      {/* KPI 3: Consumo Promedio Horario */}
      <div className="macro-kpi-card">
        <div className="macro-kpi-icon green-theme">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
        </div>
        <div className="macro-kpi-info">
          <span className="macro-kpi-label">Consumo Promedio Horario</span>
          <span className="macro-kpi-value">{formatNumber(avgConsumo)} <span className="unit-label">m³/h</span></span>
          <span className="macro-kpi-subtext">Media calculada por hora</span>
        </div>
      </div>

      {/* KPI 4: Consumo Máximo Horario */}
      <div className="macro-kpi-card">
        <div className="macro-kpi-icon orange-theme">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        </div>
        <div className="macro-kpi-info">
          <span className="macro-kpi-label">Pico Máximo Registrado</span>
          <span className="macro-kpi-value">{formatNumber(maxConsumo)} <span className="unit-label">m³/h</span></span>
          <span className="macro-kpi-subtext">Ocurrido a las: <strong>{maxConsumoHour}</strong></span>
        </div>
      </div>

      {/* KPI 5: Consumo Mínimo Horario */}
      <div className="macro-kpi-card">
        <div className="macro-kpi-icon purple-theme">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14"></path>
          </svg>
        </div>
        <div className="macro-kpi-info">
          <span className="macro-kpi-label">Flujo Mínimo Horario</span>
          <span className="macro-kpi-value">{formatNumber(minConsumo)} <span className="unit-label">m³/h</span></span>
          <span className="macro-kpi-subtext">Ocurrido a las: <strong>{minConsumoHour}</strong></span>
        </div>
      </div>
    </div>
  );
}

export default MacromedicionKpis;
