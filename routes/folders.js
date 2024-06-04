const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { ensureAuthenticated } = require('../config/auth');
const moment = require('moment-timezone');

// Ruta para listar todas las carpetas
router.get('/', ensureAuthenticated, (req, res) => {
    db.query('SELECT * FROM folders WHERE user_id = ? OR name = "Notas compartidas"', [req.user.id], (err, results) => {
        if (err) throw err;
        res.render('folders', { title: 'Carpetas', folders: results });
    });
});

// Ruta para mostrar el formulario de creación de carpetas
router.get('/new', ensureAuthenticated, (req, res) => {
    res.render('new-folder', { title: 'Nueva Carpeta' });
});

// Ruta para crear una nueva carpeta
router.post('/new', ensureAuthenticated, (req, res) => {
    const { name } = req.body;
    db.query('INSERT INTO folders (name, user_id) VALUES (?, ?)', [name, req.user.id], (err, results) => {
        if (err) {
            req.flash('error', 'Hubo un error al crear la carpeta.');
            res.redirect('/folders/new');
        } else {
            req.flash('success', 'Carpeta creada con éxito.');
            res.redirect('/folders');
        }
    });
});

// Ruta para listar notas dentro de una carpeta
router.get('/:id', ensureAuthenticated, (req, res) => {
    const folderId = req.params.id;
    db.query(`
        SELECT notes.*, users.username 
        FROM notes 
        JOIN users ON notes.user_id = users.id 
        WHERE folder_id = ? AND (notes.user_id = ? OR folder_id = (SELECT id FROM folders WHERE name = "Notas compartidas"))
        ORDER BY notes.created_at DESC
    `, [folderId, req.user.id], (err, results) => {
        if (err) throw err;

        results.forEach(note => {
            note.created_at_formatted = moment(note.created_at).tz('America/Mexico_City').format('YYYY-MM-DD HH:mm:ss');
        });

        res.render('folder-notes', { title: 'Notas en Carpeta', notes: results });
    });
});

module.exports = router;
