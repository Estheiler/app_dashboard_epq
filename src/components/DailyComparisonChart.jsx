import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

function DailyComparisonChart({ data, filterType }) {
  // Agrupar consumos por fecha
  const dailyDataMap = {};
  data.forEach((r) => {
    const date = r.fecha;
    const consumo = parseFloat(r.consolidado_m3) || parseFloat(r.consolidado) || 0;
    if (!dailyDataMap[date]) {
      dailyDataMap[date] = 0;
    }
    dailyDataMap[date] += consumo;
  });

  // Convertir a array y ordenar cronológicamente
  const dailyData = Object.keys(dailyDataMap)
    .map((date) => ({
      fecha: date,
      // Formatear fecha para el eje X (ej: '03-Jun' de '2026-06-03')
      fechaLabel: date.substring(8, 10) + '/' + date.substring(5, 7),
      consumoTotal: parseFloat(dailyDataMap[date].toFixed(2)),
    }))
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-chart-tooltip">
          <p className="tooltip-label">Fecha: {payload[0].payload.fecha}</p>
          <p className="tooltip-value">
            Consumo Total: <strong>{payload[0].value} m³</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  // Si no hay suficientes días con datos para comparar (por ejemplo, 1 solo registro), no mostrar gráfico vacío
  if (dailyData.length <= 1 && filterType === 'day') {
    return null; // Ocultar si solo hay un día y se filtró por un día único
  }

  return (
    <div className="chart-card daily-comparison-card">
      <div className="chart-card-header">
        <h3 className="chart-card-title">Comparación de Consumo Diario</h3>
        <p className="chart-card-subtitle">
          Consumo total acumulado por día durante el periodo seleccionado
        </p>
      </div>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={dailyData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2EAF0" />
            <XAxis
              dataKey="fechaLabel"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#6B7E92', fontSize: 10, fontWeight: 500 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#6B7E92', fontSize: 11, fontWeight: 500 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="consumoTotal"
              fill="#7FD349"
              radius={[4, 4, 0, 0]}
              maxBarSize={45}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default DailyComparisonChart;
