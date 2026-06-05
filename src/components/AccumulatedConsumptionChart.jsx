import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

function AccumulatedConsumptionChart({ data, isSingleDay }) {
  // Agrupar datos por hora de 1 a 24
  const accumulatedData = Array.from({ length: 24 }, (_, i) => {
    const hour = i + 1;
    const hourRecords = data.filter(r => r.hora === hour);
    
    // Sumar y promediar acumulados si hay múltiples registros por hora
    const sumAcumulado = hourRecords.reduce((acc, r) => {
      const val = parseFloat(r.consumo_acumulado_dia) || parseFloat(r.acumulado) || 0;
      return acc + val;
    }, 0);
    
    const avgAcumulado = hourRecords.length > 0 ? sumAcumulado / hourRecords.length : 0;

    return {
      hora: hour,
      horaLabel: `${hour.toString().padStart(2, '0')}:00`,
      acumulado: parseFloat(avgAcumulado.toFixed(2)),
    };
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-chart-tooltip">
          <p className="tooltip-label">{payload[0].payload.horaLabel}</p>
          <p className="tooltip-value">
            Acumulado: <strong>{payload[0].value} m³</strong>
          </p>
          {!isSingleDay && (
            <p className="tooltip-subtext">Promedio acumulado del periodo</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <h3 className="chart-card-title">Consumo Acumulado Diario</h3>
        <p className="chart-card-subtitle">
          {isSingleDay
            ? 'Crecimiento acumulado del consumo volumétrico a lo largo de las 24 horas del día'
            : 'Progresión acumulada media durante las 24 horas del periodo seleccionado'}
        </p>
      </div>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={accumulatedData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAcumulado" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#155274" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#155274" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2EAF0" />
            <XAxis
              dataKey="horaLabel"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#6B7E92', fontSize: 10, fontWeight: 500 }}
              interval={window.innerWidth < 768 ? 3 : 1}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#6B7E92', fontSize: 11, fontWeight: 500 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="acumulado"
              stroke="#155274"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorAcumulado)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default AccumulatedConsumptionChart;
