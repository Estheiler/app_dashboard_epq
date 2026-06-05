import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from 'recharts';

function HourlyConsumptionChart({ data, isSingleDay }) {
  // Agrupar datos por hora de 1 a 24
  const hourlyData = Array.from({ length: 24 }, (_, i) => {
    const hour = i + 1;
    const hourRecords = data.filter(r => r.hora === hour);
    
    // Sumar y promediar si hay múltiples registros por hora
    const sumConsumo = hourRecords.reduce((acc, r) => {
      const val = parseFloat(r.consolidado_m3) || parseFloat(r.consolidado) || 0;
      return acc + val;
    }, 0);
    
    const avgConsumo = hourRecords.length > 0 ? sumConsumo / hourRecords.length : 0;

    return {
      hora: hour,
      horaLabel: `${hour.toString().padStart(2, '0')}:00`,
      consumo: parseFloat(avgConsumo.toFixed(2)),
    };
  });

  // Encontrar el valor de consumo máximo y su hora correspondiente para resaltarlo
  let maxConsumo = 0;
  let maxHour = 12; // Valor por defecto en la mitad
  hourlyData.forEach((d) => {
    if (d.consumo > maxConsumo) {
      maxConsumo = d.consumo;
      maxHour = d.hora;
    }
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-chart-tooltip">
          <p className="tooltip-label">{payload[0].payload.horaLabel}</p>
          <p className="tooltip-value">
            Consumo: <strong>{payload[0].value} m³</strong>
          </p>
          {!isSingleDay && (
            <p className="tooltip-subtext">Promedio del periodo</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <h3 className="chart-card-title">Curva Horaria de Consumo</h3>
        <p className="chart-card-subtitle">
          {isSingleDay
            ? 'Consumo registrado hora por hora durante el día seleccionado'
            : 'Perfil promedio de consumo diario durante el periodo seleccionado'}
        </p>
      </div>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={hourlyData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorConsumo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#009DD0" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#009DD0" stopOpacity={0.0} />
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
              dataKey="consumo"
              stroke="#009DD0"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorConsumo)"
              dot={(props) => {
                // Resaltar el punto de consumo máximo
                const { cx, cy, payload } = props;
                if (payload.hora === maxHour && maxConsumo > 0) {
                  return (
                    <circle key={`dot-${payload.hora}`} cx={cx} cy={cy} r={6} fill="#007BA3" stroke="#FFFFFF" strokeWidth={2} />
                  );
                }
                return null;
              }}
            />
            
            {maxConsumo > 0 && (
              <ReferenceDot
                x={`${maxHour.toString().padStart(2, '0')}:00`}
                y={maxConsumo}
                r={6}
                fill="#009DD0"
                stroke="#FFFFFF"
                strokeWidth={2}
                isFront={true}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default HourlyConsumptionChart;
