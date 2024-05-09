// Fetch data from server and handle form submission
document.getElementById('stockForm').addEventListener('submit', async (event) => {
    event.preventDefault();
  
    const formData = new FormData(event.target);
    const fecha_desde = formData.get('fecha_desde');
    const fecha_hasta = formData.get('fecha_hasta');
    const idproducto = formData.get('idproducto');
    const sucursal = formData.get('sucursal');
  
    const url = `/stock?fecha_desde=${fecha_desde}&fecha_hasta=${fecha_hasta}&idproducto=${idproducto}&sucursal=${sucursal}`;
  
    try {
      const response = await fetch(url);
      const data = await response.json();
      const transposedData = transposeData(data);
      showTransposedData(transposedData);
    } catch (error) {
      console.error('Error al obtener los datos:', error);
    }
  });
  
  // Function to transpose data
  function transposeData(data) {
    const transposedData = {};
    data.forEach(row => {
      const date = new Date(row.fecha); // Convertir la cadena de fecha en un objeto de fecha
      const day = date.getDate(); // Obtener el día del mes
      const formattedDate = day.toString(); // Convertir el día a cadena
      if (!transposedData[row.idproducto]) {
        transposedData[row.idproducto] = {};
      }
      transposedData[row.idproducto][formattedDate] = row.cantidad_acumulada;
    });
    return transposedData;
  }
  // Function to generate table from transposed data
  function generateTable(transposedData) {
    let tableHTML = '<table><thead><tr><th>ID Producto</th>';
    // Extract all unique dates for table headers
    const dates = new Set();
    Object.values(transposedData).forEach(productData => {
      Object.keys(productData).forEach(date => {
        dates.add(date);
      });
    });
    // Sort dates in ascending order
    const sortedDates = [...dates].sort();
    // Add each date as table header
    sortedDates.forEach(date => {


      tableHTML += `<th>${date}</th>`;
    });
    tableHTML += '</tr></thead><tbody>';
    // Add rows for each product
    Object.entries(transposedData).forEach(([idProducto, productData]) => {
      tableHTML += `<tr><td>${idProducto}</td>`;
      // Fill each cell with corresponding stock data or empty if no data
      sortedDates.forEach(date => {
        tableHTML += `<td>${productData[date] || ''}</td>`;
      });
      tableHTML += '</tr>';
    });
    tableHTML += '</tbody></table>';
    return tableHTML;
  }
  
  // Function to show transposed data in the "resultados" div
  function showTransposedData(transposedData) {
    const tableHTML = generateTable(transposedData);
    document.getElementById('resultados').innerHTML = tableHTML;
  }
  
  // Additional functionality...
  
  const busquedaInput = document.getElementById('busqueda');
  const idProductoInput = document.getElementById('idproducto');
  
  fetch('/bases.json')
    .then(response => response.json())
    .then(data => {
      const opcionesDatalist = document.getElementById('opciones');
      data.forEach(producto => {
        const option = document.createElement('option');
        option.value = producto.Producto;
        option.setAttribute('data-id', producto.Codigo);
        opcionesDatalist.appendChild(option);
      });
    })
    .catch(error => console.error('Error al cargar los datos:', error));
  
  busquedaInput.addEventListener('change', () => {
    const valorSeleccionado = busquedaInput.value.trim();
    const opcionSeleccionada = document.querySelector(`#opciones option[value="${valorSeleccionado}"]`);
    const idProducto = opcionSeleccionada.getAttribute('data-id');
    idProductoInput.value = idProducto;
  });
  
  function showPage(data, pageNumber) {
    const startIndex = (pageNumber - 1) * 10;
    const endIndex = pageNumber * 10;
    const slicedData = data.slice(startIndex, endIndex);
  
    const table = `
      <table>
        <thead>
          <tr>
            <th>Sucursal</th>
            <th>Fecha</th>
            <th>ID Producto</th>
            <th>Tipo Movimiento</th>
            <th>Cantidad Acumulada</th>
          </tr>
        </thead>
        <tbody>
          ${slicedData.map(row => `
            <tr>
              <td>${row.sucursal}</td>
              <th>${new Date(row.fecha).toLocaleDateString('es-ES', { day: 'numeric' },"/",{moth:"numeric"})}</th>
              <td>${row.idproducto}</td>
              <td>${row.tipomovimiento}</td>
              <td>${row.cantidad_acumulada}</td>
            </tr>"
          `).join('')}
        </tbody>
      </table>
    `;
  
    document.getElementById('resultados').innerHTML = table;
  }
  