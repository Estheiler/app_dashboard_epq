import React from 'react';

function HydraulicInsights({ data }) {
  const recordCount = data.length;

  if (recordCount === 0) {
    return (
      <div className="insights-card empty">
        <h3 className="insights-title">Análisis Hidráulico de Consumos</h3>
        <p className="insights-empty-text">No hay suficientes datos para generar análisis.</p>
      </div>
    );
  }

  // 1. Obtener la lista de fechas en el periodo
  const uniqueDates = [...new Set(data.map(r => r.fecha))];
  const daysCount = uniqueDates.length;

  // 2. Calcular variables
  let totalConsumo = 0;
  let maxConsumo = 0;
  let maxConsumoInfo = { fecha: '', hora: 0 };
  let minConsumo = Infinity;

  // Filtrar lecturas de la madrugada (1:00 AM a 5:00 AM) para Consumo Mínimo Nocturno (FMN)
  const nightRecords = data.filter(r => r.hora >= 1 && r.hora <= 5);
  let nightSum = 0;
  let minNightFlow = Infinity;

  data.forEach((r) => {
    const consumo = parseFloat(r.consolidado_m3) || parseFloat(r.consolidado) || 0;
    totalConsumo += consumo;

    if (consumo > maxConsumo) {
      maxConsumo = consumo;
      maxConsumoInfo = { fecha: r.fecha, hora: r.hora };
    }

    if (consumo < minConsumo) {
      minConsumo = consumo;
    }
  });

  nightRecords.forEach((r) => {
    const consumo = parseFloat(r.consolidado_m3) || parseFloat(r.consolidado) || 0;
    nightSum += consumo;
    if (consumo < minNightFlow) {
      minNightFlow = consumo;
    }
  });

  const avgHourlyFlow = totalConsumo / recordCount;
  const avgNightFlow = nightRecords.length > 0 ? nightSum / nightRecords.length : 0;
  const FMN = minNightFlow === Infinity ? 0 : minNightFlow;

  // 3. Generar Alertas
  const alerts = [];
  
  // Alerta A: Consumo Nocturno Elevado (FMN > 35% del promedio horario general)
  const fmnRatio = avgHourlyFlow > 0 ? (FMN / avgHourlyFlow) * 100 : 0;
  if (FMN > 0 && fmnRatio > 35) {
    alerts.push({
      type: 'warning',
      title: 'Consumo Nocturno Elevado',
      message: `El flujo mínimo nocturno (${FMN.toFixed(1)} m³/h) representa el ${fmnRatio.toFixed(0)}% del consumo promedio. Esto puede indicar fugas constantes en la red de distribución.`
    });
  }

  // Alerta B: Picos Excesivos (Cualquier consumo > 45 m³/h)
  if (maxConsumo > 45) {
    alerts.push({
      type: 'danger',
      title: 'Pico de Consumo Crítico',
      message: `Se detectó un pico de consumo elevado de ${maxConsumo.toFixed(1)} m³/h a las ${maxConsumoInfo.hora.toString().padStart(2, '0')}:00 (${maxConsumoInfo.fecha}).`
    });
  }

  // Alerta C: Lecturas incompletas (Si algún día en el periodo tiene menos de 24 registros)
  let incompleteDays = 0;
  uniqueDates.forEach((date) => {
    const count = data.filter(r => r.fecha === date).length;
    if (count < 24) {
      incompleteDays++;
    }
  });

  if (incompleteDays > 0) {
    alerts.push({
      type: 'info',
      title: 'Lecturas Incompletas',
      message: `Existen ${incompleteDays} día(s) en el periodo que no registran las 24 lecturas horarias correspondientes.`
    });
  }

  // Si todo está correcto y no hay alertas críticas, mostrar mensaje de normalidad
  if (alerts.length === 0) {
    alerts.push({
      type: 'success',
      title: 'Comportamiento Estable',
      message: 'No se detectan fugas nocturnas ni picos de presión anormales en el periodo analizado.'
    });
  }

  return (
    <div className="insights-card">
      <div className="insights-header">
        <h3 className="insights-title">Análisis e Indicadores Hidráulicos</h3>
        <p className="insights-subtitle">Parámetros operativos derivados para la Ciudadela MIA</p>
      </div>

      <div className="insights-body-grid">
        {/* Métricas Hidráulicas */}
        <div className="insights-metrics-panel">
          <div className="insight-metric-row">
            <span className="metric-label">Flujo Mínimo Nocturno (FMN):</span>
            <span className="metric-value font-highlight">
              {FMN.toFixed(2)} <span className="metric-unit">m³/h</span>
            </span>
          </div>
          <div className="insight-metric-row">
            <span className="metric-label">Consumo Promedio Nocturno (1-5 AM):</span>
            <span className="metric-value">
              {avgNightFlow.toFixed(2)} <span className="metric-unit">m³/h</span>
            </span>
          </div>
          <div className="insight-metric-row">
            <span className="metric-label">Variación Máx / Mín Horario:</span>
            <span className="metric-value">
              {minConsumo > 0 ? (maxConsumo / minConsumo).toFixed(1) : maxConsumo.toFixed(1)} veces
            </span>
          </div>
          <div className="insight-metric-row">
            <span className="metric-label">Diferencia de Flujo (Máx - Mín):</span>
            <span className="metric-value">
              {(maxConsumo - (minConsumo === Infinity ? 0 : minConsumo)).toFixed(2)} <span className="metric-unit">m³/h</span>
            </span>
          </div>
        </div>

        {/* Alertas Operativas */}
        <div className="insights-alerts-panel">
          <h4 className="alerts-panel-title">Estado de Alertas</h4>
          <div className="alerts-list">
            {alerts.map((a, idx) => (
              <div key={idx} className={`alert-box-item ${a.type}`}>
                <div className="alert-box-header">
                  <span className="alert-icon">
                    {a.type === 'success' && '✓'}
                    {a.type === 'info' && 'ℹ'}
                    {a.type === 'warning' && '⚠'}
                    {a.type === 'danger' && '⚡'}
                  </span>
                  <span className="alert-title">{a.title}</span>
                </div>
                <p className="alert-message">{a.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HydraulicInsights;
