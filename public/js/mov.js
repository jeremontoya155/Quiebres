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
        } catch (error) {
            console.error('Error al obtener los datos:', error);
        }
    });

    // Display stock data in the results div
// Display stock data in the results div
function showStockData(data) {
    if (data && data.length > 0) {
        let tableHTML = '<table><thead><tr><th>Sucursal</th><th>Fecha</th><th>ID Producto</th><th>Tipo Movimiento</th><th>Cantidad</th><th>Unidades</th><th>Referencia</th></tr></thead><tbody>';

        data.forEach(row => {
            // Formatear la fecha en formato corto
            const fechaCorta = new Date(row.fecha).toLocaleDateString('es-ES');

            tableHTML += `
                <tr>
                    <td>${row.sucursal}</td>
                    <td>${fechaCorta}</td>
                    <td>${row.idproducto}</td>
                    <td>${row.tipomovimiento}</td>
                    <td>${row.cantidad}</td>
                    <td>${row.unidades}</td>
                    <td>${row.referencia}</td>
                </tr>
            `;
        });

        tableHTML += '</tbody></table>';
        resultadosDiv.innerHTML = tableHTML;
    } else {
        resultadosDiv.innerHTML = '<p>No se encontraron resultados</p>';
    }
}

});
