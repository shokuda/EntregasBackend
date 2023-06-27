const fs = require("fs");
const path = require("path");

const ruta = path.join(__dirname, "data.json");
//
function escribir(servidor) {
    return new Promise((resolve, reject) => {
        fs.writeFile(ruta, JSON.stringify(servidor, null, "\t"), "utf8", (error) => {
            if (error) reject(new Error("No se puede escribir el archivo"));
            resolve(true);
        });
    });

}
//Lee todos los servidores
function leer() {
    return new Promise((resolve, reject) => {
        fs.readFile(ruta, "utf8", (error, result) => {
            if (error) reject(new Error("No se pudo leer el archivo"));
            resolve(JSON.parse(result));
        });

    });

}
//Busca ID para crear un servidor
function generarID(servidores) {
    let mayorID = 0;
    servidores.forEach((servidor) => {
        if (Number(servidor.id) > mayorID) mayorID = Number(servidor.id);
    });
    return mayorID + 1;
}
//Busca por id
async function buscarPorId(id) {
    if (!id) throw new Error("Error, id indefinido");
    const servidores = await leer();
    const server = servidores.find((maquina) => maquina.id === id);
    if (!server) throw new Error("Error, el id no corresponde a un servidor existente");
    return server;
}
//Retorna los servidores
async function buscarTodos() {
    const servidores = await leer();
    return servidores;
}
//Crear un servidor
async function crear(servidor) {
    if (!servidor?.modelo || !servidor?.hardware || !servidor?.anio) throw new Error("datos incompletos");
    let servidores = await leer();
    const servidoresConId = { id: generarID(servidores), ...servidor };
    servidores.push(servidoresConId);
    await escribir(servidores);
    return servidoresConId;
}
//Actualiza un servidor
async function update(servidor) {
    if (!servidor?.id || !servidor?.modelo || !servidor?.hardware || !servidor?.anio) throw new Error("datos incompletos");
    let servidores = await leer();
    const indice = servidores.findIndex((elemento) => elemento.id === servidor.id);
    if (indice < 0) throw new Error("No se encontro el servidor");
    servidores[indice] = servidor;
    await escribir(servidores);
    return servidores[indice];
}
//Elimina un servidor
async function destroy(id) {
    if (!id) throw new Error("Error, id indefinido");
    const servidores = await leer();
    const indice = servidores.findIndex((elemento) => elemento.id === id);
    if (indice < 0) throw new Error("No se encontro el servidor");
    const servidor = servidores[indice];
    servidores.splice(indice, 1);
    await escribir(servidores);

    return servidor;
}
module.exports = { buscarPorId, buscarTodos, crear, update, destroy };