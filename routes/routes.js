const express = require('express');
const router = express.Router();

//              Rutas
// Index
const index = require('./pages/index')
// Iniciar sesión
const loginV = require('./pages/login');
// Registrarse
const registerV = require('./pages/register');
// Notas compartidas
const sharedV = require('./pages/shared');

// Uso de rutas
router.use('/', index);
router.use('/iniciar-sesion', loginV);
router.use('/register', registerV);
router.use('/shared', sharedV);

module.exports = router;