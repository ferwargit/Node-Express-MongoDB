import express from 'express';
import mascotasController from '../controllers/mascotas.controllers.js'; // Importar el controlador
import { verificarToken } from '../helpers/autenticacion.js';

const route = express.Router(); // Crear un nuevo enrutador

// Crear una nueva mascota
route.post('/', mascotasController.create);
// Obtener una mascota por su ID
route.get('/:id', mascotasController.getOne);
// Obtener todas las mascotas
route.get('/', mascotasController.getAll);
// Actualizar una mascota por su ID
route.put('/:id', verificarToken, mascotasController.update);
// route.put('/:id', mascotasController.update);
// Eliminar una mascota por su ID
route.delete('/:id', verificarToken, mascotasController.delete);
// route.delete('/:id', mascotasController.delete);

export default route; // Exportar el enrutador