const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { ensureAuthenticated } = require('../config/auth');
const moment = require('moment-timezone');

// Ruta para listar todas las notas del usuario
router.get('/', ensureAuthenticated, (req, res) => {
    db.query('SELECT * FROM notes WHERE user_id = ? AND folder_id != (SELECT id FROM folders WHERE name = "Notas compartidas")', [req.user.id], (err, results) => {
        if (err) throw err;

        results.forEach(note => {
            note.created_at_formatted = moment(note.created_at).tz('America/Mexico_City').format('YYYY-MM-DD HH:mm:ss');
        });

        res.render('notes', { title: 'Notas', notes: results });
    });
});

// Ruta para mostrar el formulario de creación de notas
router.get('/new', ensureAuthenticated, (req, res) => {
    db.query('SELECT * FROM folders WHERE user_id = ? OR name = "Notas compartidas"', [req.user.id], (err, results) => {
        if (err) throw err;
        res.render('new-note', { title: 'Nueva Nota', folders: results });
    });
});

// Ruta para crear una nueva nota
router.post('/new', ensureAuthenticated, (req, res) => {
    const { title, content, folder_id } = req.body;

    // Obtener la carpeta seleccionada o la carpeta "Todas las notas" si no se especifica una carpeta
    const folderIdQuery = folder_id ? 'SELECT ? AS id' : 'SELECT id FROM folders WHERE user_id = ? AND name = "Todas las notas"';
    const folderIdParams = folder_id ? [folder_id] : [req.user.id];

    db.query(folderIdQuery, folderIdParams, (err, folderResults) => {
        if (err) {
            req.flash('error', 'Hubo un error al obtener la carpeta.');
            res.redirect('/notes/new');
        } else {
            const assignedFolderId = folderResults[0].id;
            db.query('INSERT INTO notes (title, content, user_id, folder_id) VALUES (?, ?, ?, ?)', [title, content, req.user.id, assignedFolderId], (err, results) => {
                if (err) {
                    req.flash('error', 'Hubo un error al crear la nota.');
                    res.redirect('/notes/new');
                } else {
                    // Crear notificaciones para todos los usuarios excepto el que creó la nota
                    if (folder_id && folder_id == assignedFolderId) {
                        db.query('SELECT id FROM users WHERE id != ?', [req.user.id], (err, userResults) => {
                            if (err) throw err;

                            const notifications = userResults.map(user => [user.id, `${req.user.username} compartió una nueva nota.`, false]);
                            db.query('INSERT INTO notifications (user_id, message, is_read) VALUES ?', [notifications], (err, result) => {
                                if (err) throw err;
                            });
                        });
                    }

                    req.flash('success', 'Nota creada con éxito.');
                    res.redirect('/notes');
                }
            });
        }
    });
});

// Ruta para mostrar el formulario de edición de notas
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
    const noteId = req.params.id;
    db.query('SELECT * FROM notes WHERE id = ? AND user_id = ?', [noteId, req.user.id], (err, noteResults) => {
        if (err) throw err;
        if (noteResults.length > 0) {
            db.query('SELECT * FROM folders WHERE user_id = ? OR name = "Notas compartidas"', [req.user.id], (err, folderResults) => {
                if (err) throw err;
                res.render('edit-note', { title: 'Editar Nota', note: noteResults[0], folders: folderResults });
            });
        } else {
            res.redirect('/notes');
        }
    });
});

// Ruta para editar una nota
router.post('/edit/:id', ensureAuthenticated, (req, res) => {
    const noteId = req.params.id;
    const { title, content, folder_id } = req.body;
    db.query('UPDATE notes SET title = ?, content = ?, folder_id = ? WHERE id = ? AND user_id = ?', [title, content, folder_id, noteId, req.user.id], (err, results) => {
        if (err) {
            req.flash('error', 'Hubo un error al actualizar la nota.');
            res.redirect(`/notes/edit/${noteId}`);
        } else {
            req.flash('success', 'Nota actualizada con éxito.');
            res.redirect('/notes');
        }
    });
});

// Ruta para eliminar una nota
router.get('/delete/:id', ensureAuthenticated, (req, res) => {
    const noteId = req.params.id;
    db.query('DELETE FROM notes WHERE id = ? AND user_id = ?', [noteId, req.user.id], (err, results) => {
        if (err) {
            req.flash('error', 'Hubo un error al eliminar la nota.');
            res.redirect('/notes');
        } else {
            req.flash('success', 'Nota eliminada con éxito.');
            res.redirect('/notes');
        }
    });
});

// Ruta para buscar notas
router.get('/search', ensureAuthenticated, (req, res) => {
    const query = `%${req.query.query}%`;
    db.query('SELECT * FROM notes WHERE user_id = ? AND (title LIKE ? OR content LIKE ?)', [req.user.id, query, query], (err, results) => {
        if (err) throw err;
        results.forEach(note => {
            note.created_at_formatted = moment(note.created_at).tz('America/Mexico_City').format('YYYY-MM-DD HH:mm:ss');
        });
        res.render('notes', { title: 'Notas', notes: results });
    });
});

module.exports = router;
