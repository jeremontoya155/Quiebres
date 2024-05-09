document.getElementById('sucursalForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Evitar el envío del formulario por defecto

    const sucursal = document.getElementById('sucursal').value;

    // Realizar solicitud AJAX al servidor con el número de sucursal
    fetch(`/datos/${sucursal}`)
        .then(response => response.json())
        .then(data => {
            // Mostrar los resultados en la tabla
            const table = document.getElementById('resultados');
            table.innerHTML = ''; // Limpiar la tabla antes de agregar los nuevos datos

            // Crear encabezados de tabla
            const headers = Object.keys(data[0]);
            const headerRow = document.createElement('tr');
            headers.forEach(header => {
                const th = document.createElement('th');
                th.textContent = header;
                headerRow.appendChild(th);
            });
            // Agregar la columna adicional para la redirección
            const thRedirect = document.createElement('th');
            thRedirect.textContent = 'Acción';
            headerRow.appendChild(thRedirect);
            table.appendChild(headerRow);

            // Agregar filas de datos a la tabla
            data.forEach(rowData => {
                const row = document.createElement('tr');
                headers.forEach(header => {
                    const cell = document.createElement('td');
                    if (header.startsWith('Fecha_')) {
                        // Verificar si la fecha es nula, "31/12/1969" o menor a 2023 y mostrar "-" en su lugar
                        if (!rowData[header] || rowData[header] === "31/12/1969" || new Date(rowData[header]).getFullYear() < 2023) {
                            cell.textContent = "-";
                        } else {
                            // Formatear las fechas antes de mostrarlas
                            const fecha = new Date(rowData[header]);
                            if (!isNaN(fecha.getTime())) {
                                // La fecha es válida, formatearla y mostrarla
                                cell.textContent = fecha.toLocaleDateString('es-ES'); // Cambia 'es-ES' según tu preferencia de idioma y formato
                            } else {
                                // La fecha no es válida, mostrar "-"
                                cell.textContent = "-";
                            }
                        }
                    } else {
                        cell.textContent = rowData[header];
                    }
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
    window.location.href = '/index2.html'; // Cambia aquí la ruta de redirección según sea necesario
});
redirectCell.appendChild(redirectButton);
row.appendChild(redirectCell);


                table.appendChild(row);
            });
        })
        .catch(error => console.error('Error al obtener los datos:', error));
});


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
