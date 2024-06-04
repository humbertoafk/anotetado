const mysql = require('mysql2');
const dotenv = require('dotenv');

// Cargar las variables de entorno desde el archivo .env
dotenv.config();

// Crear una conexión a la base de datos MySQL utilizando las variables de entorno
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

// Establecer la conexión a la base de datos y manejar posibles errores
connection.connect((err) => {
  if (err) throw err;
  console.log('Conectado a la base de datos MySQL');
});

// Exportar la conexión para usarla en otras partes de la aplicación
module.exports = connection;
