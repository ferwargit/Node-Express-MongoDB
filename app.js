import 'dotenv/config';
import express from 'express';
import routesMascotas from './routes/mascotas.routes.js';
import routesUsuarios from './routes/usuarios.routes.js'; 
import bodyParser from 'body-parser';
import dbClient from './config/dbClient.js';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/pets', routesMascotas);
app.use('/users', routesUsuarios); 

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