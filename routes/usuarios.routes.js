import express from 'express';
import usuariosController from '../controllers/usuarios.controllers.js';

const route = express.Router();

// Crear una nuevo usuario
route.post('/register', usuariosController.register);

export default route;