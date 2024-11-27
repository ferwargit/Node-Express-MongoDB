import express from 'express';
import usuariosController from '../controllers/usuarios.controllers.js';
import { verificarToken } from '../helpers/autenticacion.js';

const route = express.Router();

// Crear una nuevo usuario
route.post('/register', usuariosController.register);
route.post('/login', usuariosController.login);
route.get('/profile', verificarToken, usuariosController.profile);

export default route;