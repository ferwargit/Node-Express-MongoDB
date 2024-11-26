import 'dotenv/config';
import { MongoClient } from "mongodb";

class dbClient {
    constructor() {
        const queryString = `mongodb+srv://${process.env.USER_DB}:${process.env.PASS_DB}@${process.env.SERVER_DB}/?retryWrites=true&w=majority&appName=Cluster0`;
        this.client = new MongoClient(queryString);
        this.conectarBD();
    }

    async conectarBD() {
        try {
            await this.client.connect(); // Conectar al cliente
            this.db = this.client.db('adopcion'); // Obtener la base de datos
            console.log("Base de datos conectada con éxito");
        } catch (e) {
            console.error("Error al conectar a la base de datos:", e); // Mejor manejo de errores
        }
    }

}

export default new dbClient();