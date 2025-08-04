const fs = require('fs');

// Generar datos de rendimiento con 42 clusters y 1000+ nodos
function generateLargeDataset() {
  let csvData = 'Node,Name,Parent,Type,thumbType,Description,Position,Department\n';
  let totalNodes = 0;
  
  const companies = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX', 'ADBE', 'CRM',
    'INTC', 'ORCL', 'CSCO', 'PEP', 'KO', 'DIS', 'JPM', 'V', 'WMT', 'HD', 'PG',
    'AAPL2', 'MSFT2', 'GOOGL2', 'AMZN2', 'TSLA2', 'NVDA2', 'META2', 'NFLX2', 'ADBE2', 'CRM2',
    'INTC2', 'ORCL2', 'CSCO2', 'PEP2', 'KO2', 'DIS2', 'JPM2', 'V2', 'WMT2', 'HD2', 'PG2'
  ];
  
  const companyNames = [
    'Apple Inc.', 'Microsoft Corporation', 'Alphabet Inc.', 'Amazon.com Inc.', 'Tesla Inc.',
    'NVIDIA Corporation', 'Meta Platforms Inc.', 'Netflix Inc.', 'Adobe Inc.', 'Salesforce Inc.',
    'Intel Corporation', 'Oracle Corporation', 'Cisco Systems Inc.', 'PepsiCo Inc.', 'Coca-Cola Company',
    'Walt Disney Company', 'JPMorgan Chase & Co.', 'Visa Inc.', 'Walmart Inc.', 'Home Depot Inc.', 'Procter & Gamble Co.'
  ];
  
  const departments = ['Executive', 'Engineering', 'Marketing', 'Sales', 'Finance', 'HR', 'Legal', 'Operations', 'Technology', 'Product'];
  const positions = ['CEO', 'CTO', 'CFO', 'VP', 'Director', 'Manager', 'Lead', 'Senior', 'Junior', 'Intern'];
  
  // Generar 42 empresas
  for (let i = 0; i < 42; i++) {
    const companyCode = companies[i];
    const companyName = companyNames[i % companyNames.length] + (i >= 21 ? ' 2' : '');
    
    // Nodo raíz
    csvData += `${companyCode},${companyName},,company,detail,Empresa tecnológica líder,CEO,Executive\n`;
    totalNodes++;
    
    // Generar estructura jerárquica para cada empresa
    const result = generateCompanyStructure(companyCode, departments, positions);
    csvData += result.csvData;
    totalNodes += result.nodeCount;
  }
  
  fs.writeFileSync('src/data/companies-board-performance.csv', csvData);
  console.log(`Archivo generado con ${totalNodes} nodos en 42 clusters`);
}

function generateCompanyStructure(companyCode, departments, positions) {
  let csvData = '';
  let nodeCount = 0;
  
  // CEO
  const ceoId = `${companyCode}-1`;
  csvData += `${ceoId},CEO ${companyCode},${companyCode},profile,profile,CEO de la empresa,Chief Executive Officer,Executive\n`;
  nodeCount++;
  
  // Generar 6-8 departamentos principales
  const numDepartments = 6 + Math.floor(Math.random() * 3);
  for (let dept = 1; dept <= numDepartments; dept++) {
    const deptId = `${ceoId}-${dept}`;
    const deptName = departments[dept % departments.length];
    const deptHead = `VP ${deptName}`;
    csvData += `${deptId},${deptHead},${ceoId},profile,profile,VP de ${deptName},VP ${deptName},${deptName}\n`;
    nodeCount++;
    
    // Generar 4-6 directores por departamento
    const numDirectors = 4 + Math.floor(Math.random() * 3);
    for (let dir = 1; dir <= numDirectors; dir++) {
      const dirId = `${deptId}-${dir}`;
      const dirName = `Director ${dir}`;
      csvData += `${dirId},${dirName},${deptId},profile,profile,Director de ${deptName},Director ${deptName},${deptName}\n`;
      nodeCount++;
      
      // Generar 3-5 managers por director
      const numManagers = 3 + Math.floor(Math.random() * 3);
      for (let mgr = 1; mgr <= numManagers; mgr++) {
        const mgrId = `${dirId}-${mgr}`;
        const mgrName = `Manager ${mgr}`;
        csvData += `${mgrId},${mgrName},${dirId},profile,profile,Manager de ${deptName},Manager ${deptName},${deptName}\n`;
        nodeCount++;
        
        // Generar 2-4 empleados por manager
        const numEmployees = 2 + Math.floor(Math.random() * 3);
        for (let emp = 1; emp <= numEmployees; emp++) {
          const empId = `${mgrId}-${emp}`;
          const empName = `Employee ${emp}`;
          const position = positions[Math.floor(Math.random() * positions.length)];
          csvData += `${empId},${empName},${mgrId},profile,profile,${position} de ${deptName},${position} ${deptName},${deptName}\n`;
          nodeCount++;
        }
      }
    }
  }
  
  return { csvData, nodeCount };
}

generateLargeDataset(); 