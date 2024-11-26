import 'dotenv/config';
import mongoose from 'mongoose';

class dbClient {

    constructor() {
        this.conectarBaseDatos();
    }

    async conectarBaseDatos() {
        const queryString = `mongodb+srv://${process.env.USER_DB}:${process.env.PASS_DB}@${process.env.SERVER_DB}/?retryWrites=true&w=majority&appName=Cluster0`;
        await mongoose.connect(queryString);
        console.log("Base de datos conectada con éxito");
    }

    async cerrarConexion() {
        try {
            await mongoose.disconnect(); // Cerrar cnexion
            console.log("Conexión a la base de datos cerrada");
        } catch (e) {
            console.error("Error al cerrar la base de datos:", e); // Mejor manejo de errores
        }
    }

}

export default new dbClient();