import mascotaModel from "../models/mascotas.models.js";

class mascotasController {
    constructor() {
        // Constructor vacío por ahora
    }

    async create(req, res) {
        try {
            // Lógica para crear una nueva mascota
            const data = await mascotaModel.create(req.body);
            res.status(201).json(data);
        } catch (e) {
            res.status(500).send(e); // Manejo de errores
        }
    }

    async update(req, res) {
        try {
            // Lógica para crear una nueva mascota
            const {id} = req.params;
            const data = await mascotaModel.update(id, req.body);
            res.status(200).json(data);
        } catch (e) {
            res.status(500).send(e); // Manejo de errores
        }
    }

    async delete(req, res) {
        try {
            // Lógica para crear una nueva mascota
            const {id} = req.params;
            const data = await mascotaModel.delete(id);
            res.status(206).json(data);
        } catch (e) {
            res.status(500).send(e); // Manejo de errores
        }
    }

    async getAll(req, res) {
        try {
            // Lógica para obtener todas las mascotas
            const data = await mascotaModel.getAll();
            res.status(201).json(data); // Respuesta de éxito
        } catch (e) {
            res.status(500).send(e); // Manejo de errores
        }
    }

    async getOne(req, res) {
        try {
            // Lógica para obtener una mascota por ID
            const {id} = req.params;
            const data = await mascotaModel.getOne(id);
            res.status(201).json(data); // Respuesta de éxito
        } catch (e) {
            res.status(500).send(e); // Manejo de errores
        }
    }
}

export default new mascotasController();