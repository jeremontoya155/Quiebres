document.addEventListener('DOMContentLoaded', () => {
    const stockForm = document.getElementById('stockForm');
    const resultadosDiv = document.getElementById('resultados');
    const productoInput = document.getElementById('producto');
    const idProductoInput = document.getElementById('idProducto');
    const productosDatalist = document.getElementById('productos');
   

    // Fetch all products and populate the datalist
    fetch('/bases.json')
        .then(response => response.json())
        .then(data => {
            data.forEach(producto => {
                const option = document.createElement('option');
                option.value = producto.Producto;
                option.setAttribute('data-id', producto.Codigo);
                productosDatalist.appendChild(option);
            });
        })
        .catch(error => console.error('Error al cargar los datos:', error));

    // Update the hidden input with the selected product ID
    productoInput.addEventListener('change', () => {
        const selectedOption = document.querySelector(`#productos option[value="${productoInput.value}"]`);
        const idProducto = selectedOption ? selectedOption.getAttribute('data-id') : '';
        idProductoInput.value = idProducto;
    });

    // Submit form data and fetch results
    stockForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(event.target);
        const fecha = formData.get('fecha');
        const idProducto = formData.get('idProducto');
        const sucursal = formData.get('sucursal');

        try {
            const response = await fetch(`/consulta-stock?fecha=${fecha}&idproducto=${idProducto}&sucursal=${sucursal}`);
            const data = await response.json();
            showStockData(data);
            mostrarGrafico(data);
           
        } catch (error) {
            console.error('Error al obtener los datos:', error);
        }
    });

    // Display stock data in the results div
    function showStockData(data) {
        if (data && data.length > 0) {
            let tableHTML = '<table><thead><tr><th>Fecha</th><th>ID Producto</th><th>Tipo Movimiento</th><th>Cantidad</th><th>Unidades</th></tr></thead><tbody>';

            data.forEach(row => {
                // Formatear la fecha en formato corto
                const fechaCorta = new Date(row.fecha).toLocaleDateString('es-ES');

                tableHTML += `
                    <tr>
                        <td>${fechaCorta}</td>
                        <td>${row.idproducto}</td>
                        <td>${row.tipomovimiento}</td>
                        <td>${row.cantidad}</td>
                        <td>${row.unidades}</td>
                    </tr>
                `;
            });

            tableHTML += '</tbody></table>';
            resultadosDiv.innerHTML = tableHTML;
        } else {
            resultadosDiv.innerHTML = '<p>No se encontraron resultados</p>';
        }
    }

// Función para mostrar los datos en el gráfico
function mostrarGrafico(data) {
    // Organizar los datos por tipo de movimiento
    const movimientos = {};
    data.forEach(row => {
        if (!movimientos[row.tipomovimiento]) {
            movimientos[row.tipomovimiento] = [];
        }
        movimientos[row.tipomovimiento].push({ fecha: row.fecha, cantidad: row.cantidad });
    });

    // Obtener las fechas únicas
    const fechas = [...new Set(data.map(row => row.fecha))].sort();

    // Formatear las fechas en formato corto
    const fechasCortas = fechas.map(fecha => new Date(fecha).toLocaleDateString('es-ES'));
    console.log(typeof(fechasCortas[0]))
    const fechaInicial = parseDate(fechasCortas[0]);
    const ultimoDiaDelMes = getLastDayOfMonth(fechaInicial);

// Filtrar la lista para incluir solo las fechas hasta el último día del mes
        const nuevasFechas = fechasCortas.filter(fecha => parseDate(fecha) <= ultimoDiaDelMes);

    console.log(nuevasFechas); // Imprime la nueva lista con los valores filtrados

    // Lista de colores distintos para cada tipo de movimiento
    const colores = [
        'rgba(255, 99, 132, 0.8)',  // Rojo
        'rgba(54, 162, 235, 0.8)',  // Azul
        'rgba(255, 206, 86, 0.8)',  // Amarillo
        'rgba(75, 192, 192, 0.8)',  // Verde
        'rgba(153, 102, 255, 0.8)', // Morado
        'rgba(255, 159, 64, 0.8)'   // Naranja
    ];

    // Preparar los datos para cada tipo de movimiento
    const datasets = Object.keys(movimientos).map((movimiento, index) => {
        const dataForMovimiento = fechas.map(fecha => {
            const dataForFecha = movimientos[movimiento].find(d => d.fecha === fecha);
            return dataForFecha ? dataForFecha.cantidad : 0;
        });

        return {
            label: movimiento,
            data: dataForMovimiento,
            backgroundColor: colores[index % colores.length], // Selecciona un color de la lista
            borderColor: colores[index % colores.length],     // Selecciona un color de la lista
            borderWidth: 1
        };
    });

    const ctx = document.getElementById('movimientosChart').getContext('2d');
    const movimientosChart = new Chart(ctx, {
        type: 'line', // Cambiar a un gráfico de líneas
        data: {
            labels: nuevasFechas, // Usar las fechas formateadas en formato corto
            datasets: datasets
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Cantidad'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Plazo de Tiempo'
                    }
                }
            }
        }
    });
}

function parseDate(dateString) {
    const [day, month, year] = dateString.split('/');
    return new Date(`${year}-${month}-${day}`);
}

// Función para encontrar el último día del mes para una fecha dada
function getLastDayOfMonth(date) {
    const nextMonth = new Date(date);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(0);
    return nextMonth;
}

});
