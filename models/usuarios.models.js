import mongoose from "mongoose";
import Usuario from "../schemas/usuarios.schemas.js";

class usuariosModel {

    async create(usuario) {
        return await Usuario.create(usuario);
    }

    async update(id, usuario) {
        return await Usuario.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(id) }, usuario, { new: true });
    }

    async delete(id) {
        return await Usuario.findOneAndDelete({ _id: new mongoose.Types.ObjectId(id) });
    }

    async getAll() {
        return await Usuario.find();
    }

    async getOneById(id) {
        return await Usuario.findById(id);
    }

    async getOne(filtro) {
        return await Usuario.findOne(filtro);
    }

}

export default new usuariosModel();