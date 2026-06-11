import React from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { MONTH_NAMES } from '../utils/dataParser';

export const IancAcumuladoChart = ({ chartData }) => {
  const data = chartData.map(d => ({
    name: MONTH_NAMES[d.month],
    value: d.iancAcumuladoExcel !== undefined && d.iancAcumuladoExcel !== null ? d.iancAcumuladoExcel : null,
  }));

  // Calcular el rango dinámico del eje Y
  const validValues = data.filter(d => d.value !== null).map(d => d.value);
  let yMin = 0;
  let yMax = 100;
  
  if (validValues.length > 0) {
    const minVal = Math.min(...validValues);
    const maxVal = Math.max(...validValues);
    const diff = maxVal - minVal;
    // Margen del 15% de la diferencia o un 1.5% fijo si no hay variación
    const margin = diff > 0 ? Math.max(0.5, diff * 0.15) : 1.5;
    yMin = Math.max(0, parseFloat((minVal - margin).toFixed(2)));
    yMax = parseFloat((maxVal + margin).toFixed(2));
  }

  return (
    <div className="mini-chart-wrap">
      <div className="chart-inner-title">IANC ACUMULADO</div>
      <div style={{ width: '100%', height: 120 }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
            <defs>
              <linearGradient id="colorIanc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#009DD0" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#009DD0" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#8A9BB0', fontSize: 8, fontWeight: 600 }}
              dy={5}
              interval={0}
              padding={{ left: 10, right: 10 }}
            />
            <YAxis hide domain={[yMin, yMax]} />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '10px' }}
              formatter={(val) => [`${val.toFixed(1)}%`, '']}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#009DD0"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorIanc)"
              connectNulls
              dot={{ r: 3, stroke: '#009DD0', strokeWidth: 1.5, fill: '#FFFFFF' }}
              activeDot={{ r: 5, stroke: '#009DD0', strokeWidth: 2, fill: '#FFFFFF' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const ContinuidadBarChart = ({ chartData, selectedMonth }) => {
  const data = chartData.map(d => ({
    name: MONTH_NAMES[d.month],
    value: d.continuidad || 0,
    month: d.month
  }));

  return (
    <div className="mini-chart-wrap">
      <div className="chart-inner-title">CONTINUIDAD (H)</div>
      <div style={{ width: '100%', height: 120 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }} barSize={18}>
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#8A9BB0', fontSize: 8, fontWeight: 600 }}
              dy={5}
              interval={0}
              padding={{ left: 10, right: 10 }}
            />
            <YAxis hide domain={[0, 24]} />
            <Tooltip
              cursor={{ fill: 'transparent' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '10px' }}
              formatter={(val) => [`${val}h`, '']}
            />
            <Bar dataKey="value" radius={[3, 3, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.month === selectedMonth ? '#009DD0' : '#C5D1DC'}
                  fillOpacity={entry.month === selectedMonth ? 1 : 0.6}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
