import express from 'express';
import usuariosController from '../controllers/usuarios.controllers.js';
import { verificarToken } from '../helpers/autenticacion.js';

const route = express.Router();

// Middleware para manejar métodos no permitidos
const methodNotAllowed = (req, res) => {
    res.status(405).json({ error: 'Método no permitido' });
};

// Rutas públicas
route.post('/register', usuariosController.registrar);
route.put('/register', methodNotAllowed);
route.delete('/register', methodNotAllowed);

route.post('/login', usuariosController.iniciarSesion);
route.put('/login', methodNotAllowed);
route.delete('/login', methodNotAllowed);

// Rutas protegidas
route.get('/profile', verificarToken, usuariosController.perfil);

export default route;