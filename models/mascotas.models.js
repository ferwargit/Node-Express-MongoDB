import dbClient from "../config/dbClient.js";
import { ObjectId } from "mongodb";

class mascotasModel {

    async create(mascota) {
        const colMascotas = dbClient.db.collection("mascotas");
        return await colMascotas.insertOne(mascota);
    }

    async getAll() {
        const colMascotas = dbClient.db.collection("mascotas");
        return await colMascotas.find({}).toArray();
    }

    async getOne(id) {
        const colMascotas = dbClient.db.collection("mascotas");
        return await colMascotas.findOne({_id: new ObjectId(id) });
    }

}

export default new mascotasModel();