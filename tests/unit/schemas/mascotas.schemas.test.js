import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { connect, closeDatabase, clearDatabase } from '../../config/test-setup.js';
import Mascota from '../../../schemas/mascotas.schemas.js';

describe('Mascota Schema Test Suite', () => {
    beforeAll(async () => await connect());
    afterEach(async () => await clearDatabase());
    afterAll(async () => await closeDatabase());

    const validMascotaData = {
        nombre: 'Firulais',
        tipo: 'Perro',
        raza: 'Labrador',
        edad: 5,
        descripcion: 'Un perro muy amigable',
        adoptado: false
    };

    describe('Field Validations', () => {
        it('should validate a valid mascota', async () => {
            const validMascota = new Mascota(validMascotaData);
            const savedMascota = await validMascota.save();
            
            expect(savedMascota._id).toBeDefined();
            expect(savedMascota.nombre).toBe(validMascotaData.nombre);
            expect(savedMascota.tipo).toBe(validMascotaData.tipo);
            expect(savedMascota.createdAt).toBeDefined();
            expect(savedMascota.updatedAt).toBeDefined();
        });

        it('should fail validation when nombre is missing', async () => {
            const mascotaData = { ...validMascotaData };
            delete mascotaData.nombre;
            const mascotaSinNombre = new Mascota(mascotaData);

            await expect(mascotaSinNombre.validate()).rejects.toThrow('Path `nombre` is required');
        });

        it('should fail validation when tipo is missing', async () => {
            const mascotaData = { ...validMascotaData };
            delete mascotaData.tipo;
            const mascotaSinTipo = new Mascota(mascotaData);

            await expect(mascotaSinTipo.validate()).rejects.toThrow('Path `tipo` is required');
        });

        it('should fail validation when tipo is not in enum', async () => {
            const mascotaData = {
                ...validMascotaData,
                tipo: 'Pájaro'
            };
            const mascotaTipoInvalido = new Mascota(mascotaData);

            await expect(mascotaTipoInvalido.validate()).rejects.toThrow('is not a valid enum value');
        });
    });

    describe('Age Validations', () => {
        it('should fail validation when edad is negative', async () => {
            const mascotaData = {
                ...validMascotaData,
                edad: -1
            };
            const mascotaEdadNegativa = new Mascota(mascotaData);

            await expect(mascotaEdadNegativa.validate()).rejects.toThrow('La edad no puede ser negativa');
        });

        it('should fail validation when edad is too high', async () => {
            const mascotaData = {
                ...validMascotaData,
                edad: 31
            };
            const mascotaEdadAlta = new Mascota(mascotaData);

            await expect(mascotaEdadAlta.validate()).rejects.toThrow('La edad no parece correcta');
        });
    });

    describe('Default Values', () => {
        it('should set default value for adoptado', async () => {
            const mascotaSinAdoptado = new Mascota({
                ...validMascotaData
            });
            delete mascotaSinAdoptado.adoptado;

            const savedMascota = await mascotaSinAdoptado.save();
            expect(savedMascota.adoptado).toBe(false);
        });
    });

    describe('Optional Fields', () => {
        it('should allow missing optional fields', async () => {
            const mascotaMinima = new Mascota({
                nombre: 'Mini',
                tipo: 'Gato'
            });

            const savedMascota = await mascotaMinima.save();
            expect(savedMascota._id).toBeDefined();
            expect(savedMascota.raza).toBeUndefined();
            expect(savedMascota.edad).toBeUndefined();
            expect(savedMascota.descripcion).toBeUndefined();
        });
    });
});
