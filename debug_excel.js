import * as XLSX from 'xlsx';
import fs from 'fs';

// Run from project root
const filePath = './public/indicadores_epq.xlsx';

try {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const fileBuffer = fs.readFileSync(filePath);
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { raw: true });

  console.log('--- EXCEL HEADERS ---');
  const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0];
  console.log(headers);

  console.log('\n--- LAST 5 ROWS ---');
  console.log(JSON.stringify(data.slice(-5), null, 2));

  console.log('\n--- ALL DATES ---');
  const dates = data.map(item => ({ val: item['Fecha'], type: typeof item['Fecha'] }));
  console.log(dates.slice(-10));

} catch (error) {
  console.error('Error reading excel:', error);
}
