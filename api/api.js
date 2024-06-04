const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { ensureAuthenticated } = require('../config/auth'); // Asegúrate de tener esto configurado

// Ruta para obtener el nombre del usuario
router.get('/username', ensureAuthenticated, (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const userId = req.user.id;

    db.query('SELECT username FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) {
            console.error('Error al obtener el nombre del usuario:', err);
            return res.status(500).json({ error: 'Error al obtener el nombre del usuario.' });
        }

        if (results.length > 0) {
            const username = results[0].username;
            res.json({ username });
        } else {
            res.status(404).json({ error: 'Usuario no encontrado.' });
        }
    });
});

module.exports = router;
