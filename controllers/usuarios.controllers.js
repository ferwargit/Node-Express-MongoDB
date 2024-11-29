import { generarToken } from '../helpers/autenticacion.js';
import usuariosModel from "../models/usuarios.models.js";
import bcrypt from "bcrypt";

class usuariosController {
    constructor() {
        // Constructor vacío por ahora
    }

    async registrar(req, res) {
        try {
            const { email, clave } = req.body;

            // Verificar si el usuario ya existe
            const existingUser = await usuariosModel.getByEmail(email);
            if (existingUser) {
                return res.status(400).json({ error: 'El usuario ya existe' });
            }

            // Encriptar la contraseña
            const hashedPassword = await bcrypt.hash(clave, 10);

            // Crear el usuario
            const user = await usuariosModel.create({
                ...req.body,
                clave: hashedPassword
            });

            res.status(201).json({
                message: 'Usuario registrado exitosamente',
                user: {
                    id: user._id,
                    email: user.email,
                    nombre: user.nombre,
                    rol: user.rol
                }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async iniciarSesion(req, res) {
        try {
            const { email, clave } = req.body;

            // Buscar el usuario por email
            const user = await usuariosModel.getByEmail(email);
            if (!user) {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }

            // Verificar la contraseña
            const isValidPassword = await bcrypt.compare(clave, user.clave);
            if (!isValidPassword) {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }

            // Generar token
            const token = generarToken(user);

            res.json({
                message: 'Login exitoso',
                user: {
                    id: user._id,
                    email: user.email,
                    nombre: user.nombre,
                    rol: user.rol
                },
                token
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async perfil(req, res) {
        try {
            const user = await usuariosModel.getByEmail(req.emailConectado);
            if (!user) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            res.json({
                user: {
                    id: user._id,
                    email: user.email,
                    nombre: user.nombre,
                    rol: user.rol
                }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

export default new usuariosController();