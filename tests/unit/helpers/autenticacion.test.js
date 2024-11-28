import { describe, it, expect, vi, beforeEach } from 'vitest';
import jsonwebtoken from 'jsonwebtoken';
import { generarToken, verificarToken } from '../../../helpers/autenticacion.js';
import 'dotenv/config';

// Mock jsonwebtoken
vi.mock('jsonwebtoken', () => ({
    default: {
        sign: vi.fn(),
        verify: vi.fn()
    }
}));

describe('Autenticación', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('generarToken', () => {
        it('should generate a token with correct parameters', () => {
            const email = 'test@example.com';
            const mockToken = 'mock-token';
            jsonwebtoken.sign.mockReturnValue(mockToken);

            const token = generarToken(email);

            expect(jsonwebtoken.sign).toHaveBeenCalledWith(
                { email },
                process.env.JWT_TOKEN_SECRET,
                { expiresIn: '1h' }
            );
            expect(token).toBe(mockToken);
        });
    });

    describe('verificarToken', () => {
        let mockReq;
        let mockRes;
        let mockNext;

        beforeEach(() => {
            mockReq = {
                header: vi.fn()
            };
            mockRes = {
                status: vi.fn().mockReturnThis(),
                json: vi.fn()
            };
            mockNext = vi.fn();
        });

        it('should proceed when token is valid', () => {
            const validToken = 'valid-token';
            const email = 'test@example.com';
            mockReq.header.mockReturnValue(`Bearer ${validToken}`);
            jsonwebtoken.verify.mockReturnValue({ email });

            verificarToken(mockReq, mockRes, mockNext);

            expect(jsonwebtoken.verify).toHaveBeenCalledWith(validToken, process.env.JWT_TOKEN_SECRET);
            expect(mockReq.emailConectado).toBe(email);
            expect(mockNext).toHaveBeenCalled();
        });

        it('should handle missing token', () => {
            mockReq.header.mockReturnValue(undefined);

            verificarToken(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Token requerido' });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should handle invalid token format', () => {
            mockReq.header.mockReturnValue('InvalidTokenFormat');
            jsonwebtoken.verify.mockImplementation(() => {
                throw new Error('Token verification failed');
            });

            verificarToken(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Token NO válido' });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should handle token verification failure', () => {
            const invalidToken = 'invalid-token';
            mockReq.header.mockReturnValue(`Bearer ${invalidToken}`);
            jsonwebtoken.verify.mockImplementation(() => {
                throw new Error('Token verification failed');
            });

            verificarToken(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Token NO válido' });
            expect(mockNext).not.toHaveBeenCalled();
        });
    });
});
