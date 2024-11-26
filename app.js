import 'dotenv/config';
import express from 'express';
import routesMascotas from './routes/mascotas.routes.js'; // Importar las rutas de mascotas
import bodyParser from 'body-parser';
import dbClient from './config/dbClient.js';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Usar las rutas de mascotas
app.use('/mascotas', routesMascotas); // Montar el enrutador en la ruta '/mascotas'

try {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log('Servidor activo en el puerto: ' + PORT));
} catch (e) {
    console.log(e);
}

process.on('SIGINT', async() => {
    dbClient.cerrarConexion();
    process.exit(0);
});