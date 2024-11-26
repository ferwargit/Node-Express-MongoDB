import dbClient from "../config/dbClient.js";

class mascotasModel {

    async create(mascota) {
        const colMascotas = dbClient.db.collection("mascotas");
        return await colMascotas.insertOne(mascota);
    }
}

export default new mascotasModel();