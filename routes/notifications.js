const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { ensureAuthenticated } = require('../config/auth');

// Ruta para marcar notificaciones como leídas
router.post('/mark-read', ensureAuthenticated, (req, res) => {
    const { notification_id } = req.body;
    db.query('UPDATE notifications SET is_read = TRUE WHERE id = ?', [notification_id], (err, results) => {
        if (err) throw err;
        res.redirect('/');
    });
});

module.exports = router;
