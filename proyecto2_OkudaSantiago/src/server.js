const { disconnect, connectCollection, generarID } = require('./mongodb.js');
const express = require('express');

const server = express();

// Middlewares

server.use(express.json());
server.use(express.urlencoded({ extended: true}));

// Obtener todos los servidores (filtros opcionales)
// inventario devuelve los servidores ordenados por inventario
// masNuevo devuelve el servidor más nuevo
// masViejo devuelve el servidor más viejo

server.get('/servidores', async (req, res) => {
    const { inventario, masNuevo, masViejo } = req.query;
    let servidores = [];

    try {
        const coleccion = await connectCollection('servidores');

        if (inventario) servidores = await coleccion.find().sort({ inventario: 1}).limit(0).toArray();
        else if (masNuevo) servidores = await coleccion.find().sort({ anio: 1}).limit(1).toArray();
        else if (masViejo) servidores = await coleccion.find().sort({ anio: -1}).limit(1).toArray();
        else servidores = await coleccion.find().toArray();

        res.status(200).send(JSON.stringify(servidores, null, '\t'));
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Hubo un error en el servidor');
    } finally {
        await disconnect();
    }
});
// Obtener un servidor con un id especifico
server.get('/servidores/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const coleccion = await connectCollection('servidores');
        const servidor = await coleccion.findOne({ id: Number(id)});
        if (!servidor) {
            return res.status(400).send('Error. El id no corresponde a un servidor existente');
        }

        res.status(200).send(JSON.stringify(servidor, null, '\t'));
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Hubo un problema en el sesrvidor, no se pudo obtener lo solicitado');
    } finally {
        await disconnect();
    }
});
// Crea un nuevo servidor en http://127.0.0.1:3000/servidores
server.post('/servidores', async (req, res) => {
    const { modelo, alias, hardware, inventario, anio } = req.body;
    if (!modelo && !alias && !hardware && !inventario && !anio) {
        return res.status(400).send('Error, faltan datos del servidor');
    }
    try {
        const coleccion = await connectCollection('servidores');
        const servidor = { id: await generarID(coleccion), modelo, alias, hardware, Number(inventario), Number(anio)};
        await coleccion.insertOne(servidor);

        res.status(200).send(JSON.stringify(servidor, null, '\t'));
    } catch (error) {
        console.log(error.message);
        res.status(400).send('Hubo un error en el servidor, no se puedo crear');
    }
});
// Actualiza un servidor especifico por id en http://127.0.0.1:3000/servidores/
server.put('/servidores/:id', async (req, res) => {
    const { id } = req.params;
    const { modelo, alias, hardware, inventario, anio } = req.body;
    const servidor = { modelo, alias, hardware, inventario, anio };
    if (!modelo && !alias && !hardware && !inventario && !anio) {
        return res.status(400).send('Error, faltan datos del servidor');
    }
    try {
        const coleccion = await connectCollection('servidores');
        await coleccion.updateOne({ id: Number(id)}, { $set: servidor});

        res.status(200).send(JSON.stringify(servidor, null, '\t'));
    } catch (error) {
        console.log(error.message);
        res.status(400).send('Hubo un error en el servidor, no se pudo actualizar');
    } finally {
        await disconnect();
    }
});
// Elimina un servidor especifico por id
server.delete('/servidores/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const coleccion = await connectCollection('servidores');
        const borrado = await coleccion.findOne({ id: { $eq: Number(id) } });
        await coleccion.deleteOne({ id: { $eq: Number(id) } });

        res.status(200).send(borrado);
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Hubo un problema en el servidor, no se pudo eliminar');
    } finally {
        await disconnect;
    }
});
// Control de rutas inexistentes
server.use('*', (req, res) => {
    res.status(400).send('Error 404, La url indicada no pertenece a este servidor');
});
// Metodo oyente de peticiones
server.listen(process.env.SERVER_PORT, process.env.SERVER_HOST, () => {
    console.log(`Ejecutandose en http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}/servidores`);
});
