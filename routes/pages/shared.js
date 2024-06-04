const express = require('express');
const router = express.Router();

// Ruta para la página de registrarse
router.get('/', (req, res) => {
    res.render('shared', { title: 'Notas compartidas' });
});

module.exports = router;