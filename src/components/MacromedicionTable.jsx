import React, { useState } from 'react';

function MacromedicionTable({ data }) {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Formatear valores
  const formatNumber = (num) => {
    if (num === null || num === undefined) return '-';
    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 2
    }).format(num);
  };

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

  // Ordenar datos: del registro más reciente al más antiguo para la tabla
  const sortedData = [...data].sort((a, b) => {
    const dateA = new Date(`${a.fecha}T${a.hora.toString().padStart(2, '0')}:00:00`);
    const dateB = new Date(`${b.fecha}T${b.hora.toString().padStart(2, '0')}:00:00`);
    return dateB - dateA;
  });

  // Paginación
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = sortedData.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="table-card">
      <div className="table-card-header">
        <h3 className="table-card-title">Registros Detallados del Macromedidor</h3>
        <p className="table-card-subtitle">
          Listado cronológico de lecturas del periodo seleccionado (Total: {data.length} registros)
        </p>
      </div>

      <div className="macro-table-wrapper">
        <table className="macro-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Lectura (m³)</th>
              <th>Consumo (m³/h)</th>
              <th>Observaciones</th>
              <th>Fecha Registro</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.map((row) => {
              const lectura = parseFloat(row.lectura_m3) || parseFloat(row.lectura) || 0;
              const consumo = parseFloat(row.consolidado_m3) || parseFloat(row.consolidado) || 0;

              return (
                <tr key={row.id}>
                  <td className="td-bold">{row.fecha}</td>
                  <td>{`${row.hora.toString().padStart(2, '0')}:00`}</td>
                  <td>{formatNumber(lectura)}</td>
                  <td className="td-bold text-primary">{formatNumber(consumo)}</td>
                  <td className="td-italic">{row.observaciones || 'Sin observaciones'}</td>
                  <td className="td-date">{formatDateTime(row.created_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

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
    </div>
  );
}

export default MacromedicionTable;
