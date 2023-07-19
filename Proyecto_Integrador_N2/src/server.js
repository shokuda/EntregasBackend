const { disconnect, connectCollection, generarcodigo } = require('../connection_db.js');
const express = require('express');

const server = express();
const messageNotFound = JSON.stringify({ message: 'El código no corresponde a un mueble registrado' });
const messageMissingData = JSON.stringify({message: 'Faltan datos relevantes'});
const messageErrorServer = JSON.stringify({ message: 'Se ha generado un error en el servidor' });
// Middlewares

server.use(express.json());
server.use(express.urlencoded({ extended: true}));

// Obtener todos los muebles (filtros opcionales)
// Categoria devuelve los muebles ordenados en orden ascendente
// precio_gte devuelve el mueble más nuevo
// precio_lte devuelve el mueble más viejo

server.get('/api/v1/muebles', async (req, res) => {
    const { categoria, precio_gte, precio_lte } = req.query;
    let muebles = [];

    try {
        const coleccion = await connectCollection('muebles');

        if (categoria) muebles = await coleccion.find({categoria}).sort({ nombre: 1}).toArray();
        else if (precio_gte) muebles = await coleccion.find({ precio: {$gte: Number(precio_gte)} }).sort({ precio: 1}).toArray();
        else if (precio_lte) muebles = await coleccion.find({ precio: {$lte: Number(precio_lte)} }).sort({ precio: -1}).toArray();
        else muebles = await coleccion.find().toArray();

        res.status(200).send(JSON.stringify({payload: muebles}));
    } catch (error) {
        console.log(error.message);
        res.status(500).send(messageErrorServer);
    } finally {
        await disconnect();
    }
});
// Obtener un mueble con un codigo especifico
server.get('/api/v1/muebles/:codigo', async (req, res) => {
    const { codigo } = req.params;
    try {
        const coleccion = await connectCollection('muebles');
        const mueble = await coleccion.findOne({ codigo: Number(codigo)});
        if (!mueble) {
            return res.status(400).send(messageNotFound);
        }

        res.status(200).send(JSON.stringify({payload: mueble}));
    } catch (error) {
        console.log(error.message);
        res.status(500).send(messageErrorServer);
    } finally {
        await disconnect();
    }
});
// Crea un nuevo mueble en http://127.0.0.1:3005/api/v1/muebles
server.post('/api/v1/muebles', async (req, res) => {
    const { nombre, precio, categoria } = req.body;
    if (!nombre && !precio && !categoria) {
        return res.status(400).send(messageMissingData);
    }
    try {
        const coleccion = await connectCollection('muebles');
        const mueble = { codigo: await generarcodigo(coleccion), nombre, precio: Number(precio), categoria };
        await coleccion.insertOne(mueble);
        res.status(201).send(JSON.stringify({message: 'Registro creado', payload: mueble}));
    } catch (error) {
        console.log(error.message);
        res.status(500).send(messageErrorServer);
    }
});
// Actualiza un mueble especifico por codigo en http://127.0.0.1:3005/api/v1/muebles/
server.put('/api/v1/muebles/:codigo', async (req, res) => {
    const { codigo } = req.params;
    const { nombre, precio, categoria } = req.body;
    if (!nombre && !precio && !categoria) {
        return res.status(400).send(messageMissingData);
    }
    try {
        const coleccion = await connectCollection('muebles');
        let mueble = await coleccion.findOne({ codigo: Number(codigo)});
        if (!mueble) {
            return res.status(400).send(messageNotFound);
        }
        mueble = { nombre, precio: Number(precio), categoria };
        await coleccion.updateOne({ codigo: Number(codigo)}, { $set: mueble});
        res.status(200).send({message: 'Registro actualizado', payload: {codigo, ...mueble}});
    } catch (error) {
        console.log(error.message);
        res.status(500).send(messageErrorServer);
    } finally {
        await disconnect();
    }
});
// Elimina un mueble especifico por codigo
server.delete('/api/v1/muebles/:codigo', async (req, res) => {
    const { codigo } = req.params;
    try {
        const coleccion = await connectCollection('muebles');
        let mueble = await coleccion.findOne({ codigo: Number(codigo)});
        if (!mueble) {
            return res.status(400).send(messageNotFound);
        }
        await coleccion.deleteOne({ codigo: { $eq: Number(codigo) } });
        res.status(200).send({message: 'Registro eliminado'});
    } catch (error) {
        console.log(error.message);
        res.status(500).send(messageErrorServer);
    } finally {
        await disconnect;
    }
});
// Control de rutas inexistentes
server.use('*', (req, res) => {
    res.status(400).send('Error 404, La url indicada no pertenece a este mueble');
});
// Metodo oyente de peticiones
server.listen(process.env.SERVER_PORT, process.env.SERVER_HOST, () => {
    console.log(`Ejecutandose en http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}/api/v1/muebles`);
});
