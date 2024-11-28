import 'dotenv/config';
import express from 'express';
import routesMascotas from './routes/mascotas.routes.js';
import routesUsuarios from './routes/usuarios.routes.js'; 
import bodyParser from 'body-parser';
import dbClient from './config/dbClient.js';

const app = express();

// Configurar middleware
try {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
} catch (error) {
    console.log(error);
}

// Configurar rutas
try {
    app.use('/pets', routesMascotas);
    app.use('/users', routesUsuarios);
} catch (error) {
    console.log(error);
}

// Iniciar servidor
try {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log('Servidor activo en el puerto: ' + PORT));
} catch (error) {
    console.log(error);
}

// Manejo de señales del sistema
process.on('SIGINT', async () => {
    try {
        await dbClient.cerrarConexion();
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
});