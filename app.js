import 'dotenv/config';
import express from 'express';
import routesMascotas from './routes/mascotas.routes.js';
import routesUsuarios from './routes/usuarios.routes.js'; 
import bodyParser from 'body-parser';
import dbClient from './config/dbClient.js';

const app = express();

// Middleware para verificar Content-Type
app.use((req, res, next) => {
    if (req.method === 'GET') {
        return next();
    }
    if (!req.is('json') && req.headers['content-type'] !== 'application/x-www-form-urlencoded') {
        return res.status(415).json({ error: 'Tipo de contenido no soportado. Use application/json' });
    }
    next();
});

// Configurar middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configurar rutas
app.use('/api/mascotas', routesMascotas);
app.use('/api/usuarios', routesUsuarios);

// Manejo de rutas no encontradas
app.use((req, res, next) => {
    const knownRoutes = ['/api/mascotas', '/api/usuarios'];
    const requestedPath = req.path;
    
    // Si la ruta base coincide con una ruta conocida pero el método no está permitido
    if (knownRoutes.some(route => requestedPath.startsWith(route))) {
        return res.status(405).json({ error: 'Método no permitido' });
    }
    
    // Si la ruta no existe
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, (err) => {
    if (err) {
        throw err;
    }
    console.log('Servidor activo en el puerto: ' + PORT);
});

// Manejo de señales del sistema
process.on('SIGINT', async () => {
    try {
        await dbClient.cerrarConexion();
        process.exit(0);
    } catch (error) {
        console.error('Error al cerrar la conexión:', error);
        process.exit(1);
    }
});

export default app;