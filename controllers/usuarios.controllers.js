import usuariosModel from "../models/usuarios.models.js";
import bcrypt from "bcrypt";

class usuariosController {
    constructor() {
        // Constructor vacío por ahora
    }

    async register(req, res) {
        try {
            const { email, nombre, telefono, clave } = req.body;

            const usuarioExiste = await usuariosModel.getOne({ email });
            if (usuarioExiste) {
                return res.status(400).json({ error: "El usuario ya existe." });
            }

            const claveEncryptada = await bcrypt.hash(clave, 10);

            const data = await usuariosModel.create({
                email,
                nombre,
                telefono,
                clave: claveEncryptada
            });
            res.status(201).json(data);
        } catch (e) {
            console.log(e);
            res.status(500).send(e); // Manejo de errores
        }
    }

    async login(req, res) {
        try {
            const { email, clave } = req.body;

            const usuarioExiste = await usuariosModel.getOne({ email });
            if (!usuarioExiste) {
                return res.status(400).json({ error: "El usuario NO existe." });
            }

            const claveValida = await bcrypt.compare(clave, usuarioExiste.clave);

            if (!claveValida) {
                return res.status(400).json({ error: "Clave NO válida." });
            }

            return res.status(200).json({ msg: 'Usuario autenticado' });

        } catch (e) {
            
        }
    }
}

export default new usuariosController();