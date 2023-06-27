const express = require("express");
const { buscarPorId, buscarTodos, crear, update, destroy } = require("./database/data.manager.js");

require('dotenv').config();

const server = express();

// Middlewares
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// Obtener todos los servidores: Ruta GET http://127.0.0.1:3000/servidores
server.get('/servidores', (req, res) => {

    buscarTodos()
        .then((servidores) => res.status(200).send(servidores))
        .catch((error) => res.status(400).send(error.message));

});

// Obtener un servidor específico: Ruta GET http://127.0.0.1:3000/servidores/1
server.get('/servidores/:id', (req, res) => {
    const { id } = req.params;

    buscarPorId(Number(id))
        .then((servidor) => res.status(200).send(servidor))
        .catch((error) => res.status(400).send(error.message));
});

// Crear un nuevo servidor: Ruta POST http://127.0.0.1:3000/servidores
server.post('/servidores', (req, res) => {
    const { modelo, hardware, anio } = req.body;

    crear({ modelo, hardware, anio })
        .then((servidores) => res.status(201).send(servidores))
        .catch((error) => res.status(400).send(error.message));
});

// Actualizar un servidor específico: Ruta PUT http://127.0.0.1:3000/servidores/1
server.put('/servidores/:id', (req, res) => {
    const { id } = req.params;
    const { modelo, hardware, anio } = req.body;

    update({ id: Number(id), modelo, hardware, anio })
        .then((servidor) => res.status(200).send(servidor))
        .catch((error) => res.status(400).send(error.message));
});

// Eliminar un servidor específico: Ruta DELETE http://127.0.0.1:3000/servidores/1
server.delete('/servidores/:id', (req, res) => {
    const { id } = req.params;

    destroy(Number(id))
        .then((servidor) => res.status(200).send(servidor))
        .catch((error) => res.status(400).send(error.message));
});

// Control de rutas inexistentes
server.use('*', (req, res) => {
    res.status(404).send(`<h1>Error 404</h1><h3>La URL indicada no existe en este servidor</h3>`);
});

// Método oyente de peteciones
server.listen(process.env.SERVER_PORT, process.env.SERVER_HOST, () => {
    console.log(`Ejecutandose en http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}/servidores`);
});