import mongoose from 'mongoose';
import Usuario from '../schemas/usuarios.schemas.js';

class UsuarioModel {
    async create(usuario) {
        return await Usuario.create(usuario);
    }

    async update(id, usuario) {
        const doc = await Usuario.findById(id);
        if (!doc) {
            throw new Error('Usuario no encontrado');
        }

        // Aplicamos las actualizaciones al documento
        Object.assign(doc, usuario);

        // Validamos el documento antes de guardar
        const validationError = doc.validateSync();
        if (validationError) {
            const errorMessage = Object.values(validationError.errors)[0].message;
            throw new Error(errorMessage);
        }

        // Solo guardamos si la validación pasa
        return await doc.save({ validateBeforeSave: false });
    }

    async delete(id) {
        return await Usuario.findOneAndDelete({ _id: new mongoose.Types.ObjectId(id) });
    }

    async getById(id) {
        return await Usuario.findOne({ _id: new mongoose.Types.ObjectId(id) });
    }

    async getAll() {
        return await Usuario.find({});
    }

    async getByEmail(email) {
        return await Usuario.findOne({ email });
    }
}

export default new UsuarioModel();