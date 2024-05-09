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
  
  // Function to transpose data and group by month
  function transposeData(data) {
    const transposedData = {};
  
    data.forEach(row => {
      const date = new Date(row.fecha);
      const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
      if (!transposedData[monthYear]) {
        transposedData[monthYear] = {};
      }
  
      const day = date.getDate();
      const formattedDate = day.toString();
  
      if (!transposedData[monthYear][formattedDate]) {
        transposedData[monthYear][formattedDate] = {};
      }
  
      transposedData[monthYear][formattedDate][row.idproducto] = row.cantidad_acumulada;
    });
  
    return transposedData;
  }
  
  // Function to generate table from transposed data grouped by month
  function generateTable(transposedData) {
    let tablesHTML = '';
  
    for (const [monthYear, monthData] of Object.entries(transposedData)) {
      tablesHTML += `<h2>${monthYear}</h2><table><thead><tr><th>ID Producto</th>`;
  
      const days = Object.keys(monthData).sort((a, b) => parseInt(a) - parseInt(b));
  
      days.forEach(day => {
        tablesHTML += `<th>${day}</th>`;
      });
  
      tablesHTML += '</tr></thead><tbody>';
  
      const productIDs = new Set();
      Object.values(monthData).forEach(dayData => {
        Object.keys(dayData).forEach(productID => {
          productIDs.add(productID);
        });
      });
  
      productIDs.forEach(productID => {
        tablesHTML += `<tr><td>${productID}</td>`;
        days.forEach(day => {
          const cellData = monthData[day][productID] || '';
          tablesHTML += `<td>${cellData}</td>`;
        });
        tablesHTML += '</tr>';
      });
  
      tablesHTML += '</tbody></table>';
    }
  
    return tablesHTML;
  }
  
  // Function to show transposed data in the "resultados" div
  function showTransposedData(transposedData) {
    const tablesHTML = generateTable(transposedData);
    document.getElementById('resultados').innerHTML = tablesHTML;
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
