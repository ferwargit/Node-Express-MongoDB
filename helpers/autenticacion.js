import 'dotenv/config';
import jsonwebtoken from 'jsonwebtoken';

export function generarToken(email) {
    return jsonwebtoken.sign({ email }, process.env.JWT_TOKEN_SECRET, { expiresIn: '1h' });
}
