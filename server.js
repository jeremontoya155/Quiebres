require('dotenv').config(); // Cargar variables de entorno desde el archivo .env
const express = require('express');
const mysql = require('mysql');
const dotenv = require('dotenv');
const path = require('path');

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


app.get('/bases.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'bases.json'));
});

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
        stock.Cantidad
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
        stock.Cantidad <0;
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
  res.sendFile(path.join(__dirname, 'index.html')); // Usar path.join para construir la ruta del archivo
});

// Endpoint para consultar el stock acumulado
app.get('/stock', (req, res) => {
  // Obtener parámetros desde la URL
  const fecha_desde = req.query.fecha_desde;
  const fecha_hasta = req.query.fecha_hasta;
  const sucursal = req.query.sucursal;
  const idproducto = req.query.idproducto;

  // Consulta SQL para obtener el stock acumulado
  const sqlQuery = `
    SELECT 
      s.sucursal,
      d.fecha,
      s.idproducto,
      'S' AS tipomovimiento,
      SUM(
          CASE WHEN m.fecha <= d.fecha THEN m.cantidad ELSE 0 END
      ) AS cantidad_acumulada
    FROM (
        SELECT DISTINCT fecha
        FROM stockmovimientos
        WHERE fecha BETWEEN ? AND ?
    ) AS d
    CROSS JOIN stock AS s  
    LEFT JOIN stockmovimientos AS m ON s.sucursal = m.sucursal
        AND s.idproducto = m.idproducto
        AND m.fecha <= d.fecha
    WHERE s.idproducto = ? AND s.sucursal = ?
    GROUP BY s.sucursal, d.fecha, s.idproducto
    ORDER BY d.fecha;
  `;

  // Ejecutar la consulta SQL
  connection.query(sqlQuery, [fecha_desde, fecha_hasta, idproducto, sucursal], (error, results) => {
    if (error) {
      console.error('Error al ejecutar la consulta SQL:', error);
      res.status(500).json({ error: 'Error al ejecutar la consulta' });
      return;
    }

    // Imprimir los datos devueltos por el servidor en la consola
    console.log('Datos devueltos por el servidor:', results);

    res.json(results);
  });
});

// Nueva ruta para consultar datos de stock
app.get('/consulta-stock', (req, res) => {
  // Obtener parámetros desde la URL
  const { fecha, idproducto, sucursal } = req.query;

  // Consulta SQL para obtener los datos de stock
  const sqlQuery = `
    SELECT sucursal, CURDATE() as fecha, idproducto, 'S' as tipomovimiento, cantidad, unidades
    FROM stock 
    WHERE idproducto = ? AND sucursal = ?
    
    UNION ALL
    
    SELECT sucursal, fecha, idproducto, tipomovimiento, SUM(cantidad)*(-1) as cantidad, SUM(unidades)*(-1 ) as unidades
    FROM stockmovimientos 
    WHERE fecha >= ? AND idproducto = ? AND sucursal = ?
    GROUP BY sucursal, fecha, idproducto, tipomovimiento
  `;

  // Ejecutar la consulta SQL
  connection.query(sqlQuery, [idproducto, sucursal, fecha, idproducto, sucursal], (error, results) => {
    if (error) {
      console.error('Error al ejecutar la consulta SQL:', error);
      res.status(500).json({ error: 'Error al ejecutar la consulta' });
      return;
    }

    // Enviar los resultados como respuesta
    res.json(results);
  });
});



// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
