document.getElementById('sucursalForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Evitar el envío del formulario por defecto

    const sucursal = document.getElementById('sucursal').value;

    // Realizar solicitud AJAX al servidor con el número de sucursal
    fetch(`/datos/${sucursal}`)
        .then(response => response.json())
        .then(data => {
            // Mostrar los resultados en la tabla
            const tableBody = document.querySelector('#resultados tbody');
            tableBody.innerHTML = ''; // Limpiar el cuerpo de la tabla antes de agregar los nuevos datos

            // Agregar filas de datos a la tabla
            data.forEach(rowData => {
                const row = document.createElement('tr');
                Object.values(rowData).forEach(value => {
                    const cell = document.createElement('td');
                    cell.textContent = value;
                    row.appendChild(cell);
                });

                // Agregar la celda con el botón de redirección
                const redirectCell = document.createElement('td');
                const redirectButton = document.createElement('button');
                redirectButton.textContent = '+';
                redirectButton.style.backgroundColor = 'green'; // Cambia el color de fondo a verde
                redirectButton.style.color = 'white'; // Cambia el color del texto a blanco
                redirectButton.style.fontWeight = 'bold'; // Aplica negrita al texto
                redirectButton.style.border = 'none'; // Elimina el borde del botón
                redirectButton.style.padding = '0.5em 1em'; // Ajusta el relleno del botón
                redirectButton.addEventListener('click', () => {
                    window.location.href = '/acumulado.html'; // Cambia aquí la ruta de redirección según sea necesario
                });
                redirectCell.appendChild(redirectButton);
                row.appendChild(redirectCell);

                tableBody.appendChild(row);
            });

            // Llamar a la función para crear los campos de filtro
            crearCamposDeFiltro(data[0]);
        })
        .catch(error => console.error('Error al obtener los datos:', error));
});

// Función para crear los campos de filtro
function crearCamposDeFiltro(dataRow) {
    const headers = Object.keys(dataRow);
    const tableHeader = document.querySelectorAll('#resultados thead th');
    const filtrosRow = document.createElement('tr');

    // Crear campos de filtro para los campos Producto, IDProducto y Cantidad
    headers.forEach((header, index) => {
        const filtroInput = document.createElement('input');
        filtroInput.setAttribute('type', 'text');
        filtroInput.setAttribute('placeholder', `${header}`);
        filtroInput.addEventListener('input', aplicarFiltro);
        tableHeader[index].appendChild(filtroInput);
    });
}

// Función para aplicar los filtros
// Función para aplicar los filtros
function aplicarFiltro() {
    const filtroInputs = document.querySelectorAll('#resultados thead input');
    const filtroValues = Array.from(filtroInputs).map(input => input.value.toLowerCase().trim());

    const filas = document.querySelectorAll('#resultados tbody tr');

    filas.forEach(fila => {
        const cells = fila.querySelectorAll('td');
        let mostrarFila = true;

        cells.forEach((cell, index) => {
            const cellValue = parseFloat(cell.textContent.toLowerCase()); // Convertir el texto a número
            const filtroValue = parseFloat(filtroValues[index]); // Convertir el valor del filtro a número
            if (!isNaN(cellValue) && !isNaN(filtroValue) && cellValue >= filtroValue) { // Comprobar si el valor de la celda es mayor o igual al valor del filtro
                mostrarFila = false;
            }
        });

        fila.style.display = mostrarFila ? '' : 'none';
    });
}

// Obtener el botón de descarga y la tabla
const btnDescargar = document.getElementById('descargarTabla');
const tabla = document.getElementById('resultados');

// Agregar evento de clic al botón de descarga
btnDescargar.addEventListener('click', () => {
    // Crear un elemento <a> para la descarga
    const enlaceDescarga = document.createElement('a');
    enlaceDescarga.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(obtenerDatosTablaComoCSV()));
    enlaceDescarga.setAttribute('download', 'tabla_stock.csv');
    enlaceDescarga.style.display = 'none';
    document.body.appendChild(enlaceDescarga);
    // Hacer clic en el enlace para iniciar la descarga
    enlaceDescarga.click();
    // Eliminar el enlace después de la descarga
    document.body.removeChild(enlaceDescarga);
});

// Función para obtener los datos de la tabla como CSV
function obtenerDatosTablaComoCSV() {
    const filas = tabla.querySelectorAll('tr');
    let csv = '';
    // Recorrer cada fila de la tabla
    filas.forEach((fila, indiceFila) => {
        const columnas = fila.querySelectorAll('td, th');
        // Recorrer cada columna de la fila
        columnas.forEach((columna, indiceColumna) => {
            csv += columna.textContent;
            // Agregar coma si no es la última columna
            if (indiceColumna < columnas.length - 1) {
                csv += ',';
            }
        });
        // Agregar nueva línea si no es la última fila
        if (indiceFila < filas.length - 1) {
            csv += '\n';
        }
    });
    return csv;
}
