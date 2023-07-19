const { MongoClient } = require('mongodb');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env')});

const client = new MongoClient(process.env.DATABASE_URL);
// Conecta a la base de datos
async function connect() {
    let connection = null;
    console.log('Conectando...');

    try {
        connection = await client.connect();
    } catch (error) {
        console.log(error.message);
    }
    return connection;
}
// Desconecta la base de datos
async function disconnect() {
    try {
        await client.connect();
        console.log('Desconectando');
    } catch (error) {
        console.log(error.message);
    }
}
// Devuelve la coleccion que pasa como parametro
async function connectCollection(collectionName) {
    const conexion = await connect();
    const db = conexion.db(process.env.DATABASE_NAME);
    const coleccion = db.collection(collectionName);

    return coleccion;
}
// genera ID para agregar objeto
async function generarcodigo(collection) {
    const objMaxId = await collection.find().sort({ codigo: -1 }).limit(1).toArray();
    const maxId = objMaxId[0]?.codigo ?? 0;

    return maxId + 1;
}

module.exports = { disconnect, connectCollection, generarcodigo };
