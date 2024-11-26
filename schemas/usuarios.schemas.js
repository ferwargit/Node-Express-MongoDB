import mongoose from "mongoose";

const usuariosSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        nombre: {
            type: String,
            required: true,
            trim: true
        },
        telefono: {
            type: String,
            required: true
        },
        clave: {
            type: String,
            required: true
        }
    }, { timestamps: true }
);

export default mongoose.model('usuarios', usuariosSchema);