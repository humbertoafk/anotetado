const express = require('express');
const router = express.Router();

// Ruta para la página de inicio de sesión
router.get('/', (req, res) => {
    res.render('iniciar-sesion', { title: 'Inicio de Sesión' });
});

module.exports = router;