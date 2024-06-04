const express = require('express');
const router = express.Router();

// Ruta para la página de registrarse
router.get('/', (req, res) => {
    res.render('registrarse', { title: 'Registrarse' });
});

module.exports = router;