const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');


const app = express();
app.use(cors());


// Iniciar el servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor iniciado en el puerto ${PORT}`);
});

//Conexión para la base de datos
const db = new sqlite3.Database('./domicilios.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Conectado a la base de datos.');
        createTable(); 
    }
});

app.use(bodyParser.json());


// Función para crear la tabla
function createTable() {
    const sql = 'CREATE TABLE IF NOT EXISTS domicilios (id_domicilio INTEGER PRIMARY KEY, direccion TEXT, descripcion TEXT, valorPrenda INTEGER, valorDomicilio INTEGER, valorPagar INTEGER, estado TEXT, novedades TEXT)';
    db.run(sql, (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Tabla "domicilios" creada o ya existe.');
        }
    });
}


// Ruta para manejar el POST
app.post('/domicilios', (req, res) => {
    try {
        const { direccion, descripcion, valorPrenda, valorDomicilio, valorPagar, estado, novedades} = req.body;
        const sql = 'INSERT INTO domicilios (direccion, descripcion, valorPrenda, valorDomicilio, valorPagar, estado, novedades) VALUES (?, ?, ?, ?, ?, ?, ?)';
        db.run(sql, [direccion, descripcion, valorPrenda, valorDomicilio, valorPagar, estado, novedades], function(err) {
            if (err) {
                console.error('Error al insertar el domicilio: ' + err.message);
                res.status(400).json({ status: 400, success: false });
            } else {
                console.log(`Domicilio agregado con ID: ${this.lastID}`);
                res.status(201).json({ status: 201, success: true, id: this.lastID });
            }
        });
    } catch (error) {
        console.error('Error en la solicitud POST: ' + error.message);
        res.status(500).json({ status: 500, success: false });
    }
});


//get todos

app.get('/domicilios', (req, res) => {
    const sql = 'SELECT * FROM domicilios';
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Error al obtener domicilios:', err.message);
            return res.status(500).json({ status: 500, success: false, error: 'Error al obtener domicilios' });
        }
        if (rows.length === 0) {
            return res.status(404).json({ status: 404, success: false, message: 'No se encontraron domicilios' });
        }
        res.status(200).json({ status: 200, success: true, data: rows });
    });
});


// Ruta para manejar el GET de una usuarios por ID
app.get('/domicilios/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'SELECT * FROM domicilios WHERE id_domicilio = ?';
    db.get(sql, [id], (err, row) => {
        if (err) {
            console.error('Error al obtener domicilio por ID: ' + err.message);
            res.status(500).json({ status: 500, success: false });
        } else {
            if (row) {
                res.json({ status: 200, success: true, data: row });
            } else {
                res.status(404).json({ status: 404, success: false, message:` Domicilio con ID ${id} no encontrada `});
            }
        }
    });
});


// Ruta para manejar el PUT de una usuarios por ID
app.put('/domicilios/:id', (req, res) => {
    const id = req.params.id;
    const {direccion, descripcion, valorPrenda, valorDomicilio, valorPagar, estado, novedades } = req.body;
    const sql = 'UPDATE domicilios SET direccion = ?, descripcion = ?, valorPrenda = ?, valorDomicilio = ?, valorPagar = ?, estado = ?, novedades = ?  WHERE id_domicilio = ?';
    db.run(sql, [direccion, descripcion, valorPrenda, valorDomicilio, valorPagar, estado, novedades, id], function(err) {
        if (err) {
            console.error('Error al actualizar domicilios: ' + err.message);
            res.status(400).json({ status: 400, success: false });
        } else {
            if (this.changes > 0) {
                console.log(`Domicilio con ID ${id} actualizada.`);
                res.status(200).json({ status: 200, success: true });
            } else {
                res.status(404).json({ status: 404, success: false, message: `Domicilio con ID ${id} no encontrada` });
            }
        }
    });
});


// Ruta para manejar el DELETE de una usuarios por ID
app.delete('/domicilios/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM domicilios WHERE id_domicilio = ?';
    db.run(sql, id, function(err) {
        if (err) {
            console.error('Error al eliminar domicilio: ' + err.message);
            res.status(500).json({ status: 500, success: false });
        } else {
            if (this.changes > 0) {
                console.log(`Domicilio con ID ${id} eliminada.`);
                res.status(200).json({ status: 200, success: true });
            } else {
                res.status(404).json({ status: 404, success: false, message:` Domicilio con ID ${id} no encontrada `});
            }
        }
    });
});

