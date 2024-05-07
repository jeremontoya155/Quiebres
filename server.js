require('dotenv').config(); // Cargar variables de entorno desde el archivo .env
const express = require('express');
const mysql = require('mysql');

const app = express();
const port = 3000;
app.use(express.static('public'));

// Configuración de la conexión a la base de datos utilizando las variables de entorno
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

// Conectar a la base de datos
connection.connect();

// Ruta para obtener los datos de la consulta SQL con el número de sucursal como parámetro
app.get('/datos/:sucursal', (req, res) => {
  const sucursal = req.params.sucursal;

  // Definir la consulta SQL principal utilizando la variable de sucursal
  const mainQuery = `
    SELECT 
        stock.IDProducto, 
        medicamentos.codebar,
        stock.Sucursal, 
        Concat(medicamentos.Producto," ",  
            medicamentos.Presentaci) as Producto
        , 
        stock.Cantidad,
        DATE_FORMAT(MAX(CASE WHEN stockmovimientos.TipoMovimiento = 'E' THEN stockmovimientos.Fecha ELSE NULL END), '%Y-%m-%d') AS Fecha_E,
        SUM(CASE WHEN stockmovimientos.TipoMovimiento = 'E' THEN stockmovimientos.Cantidad ELSE 0 END) AS Cargas,
        DATE_FORMAT(MAX(CASE WHEN stockmovimientos.TipoMovimiento = 'F' THEN stockmovimientos.Fecha ELSE NULL END), '%Y-%m-%d') AS Fecha_F,
        SUM(CASE WHEN stockmovimientos.TipoMovimiento = 'F' THEN stockmovimientos.Cantidad ELSE 0 END) AS Ventas,
        DATE_FORMAT(MAX(CASE WHEN stockmovimientos.TipoMovimiento = 'P' THEN stockmovimientos.Fecha ELSE NULL END), '%Y-%m-%d') AS Fecha_P,
        SUM(CASE WHEN stockmovimientos.TipoMovimiento = 'P' THEN stockmovimientos.Cantidad ELSE 0 END) AS Envios
    FROM 
        stock 
    INNER JOIN 
        medicamentos ON stock.IDProducto = medicamentos.CodPlex
    LEFT JOIN 
        stockmovimientos ON stock.IDProducto = stockmovimientos.IDProducto
    WHERE 
        stock.Sucursal = ?
        AND medicamentos.Activo = "S" 
        AND medicamentos.CodRubro = 1
        AND medicamentos.Fraccionable = 0 
        AND medicamentos.UnidadesPadre = 0
        AND stockmovimientos.Fecha >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) -- últimos dos días
    GROUP BY 
        stock.IDProducto, 
        medicamentos.codebar,
        stock.Sucursal, 
        medicamentos.Producto,  
        medicamentos.Presentaci, 
        stock.Cantidad
    HAVING 
        stock.Cantidad = 0;
  `;

  // Realizar la consulta SQL principal con la variable de sucursal ya definida
  connection.query(mainQuery, [sucursal], (error, results, fields) => {
    if (error) {
      console.error('Error al ejecutar la consulta principal:', error);
      res.status(500).send('Error interno del servidor');
      return;
    }

    // Enviar los resultados como respuesta
    res.json(results);
  });
});

// Servir la página HTML
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
