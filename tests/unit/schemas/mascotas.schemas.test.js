import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
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
            const mascota = new Mascota(validMascotaData);
            await expect(mascota.validate()).resolves.toBeUndefined();
        });

        it('should fail validation when nombre is missing', async () => {
            const mascotaData = { ...validMascotaData };
            delete mascotaData.nombre;
            const mascota = new Mascota(mascotaData);
            await expect(mascota.validate()).rejects.toThrow('mascotas validation failed: nombre: El nombre es requerido');
        });

        it('should fail validation when nombre is too short', async () => {
            const mascotaData = { ...validMascotaData, nombre: 'A' };
            const mascota = new Mascota(mascotaData);
            await expect(mascota.validate()).rejects.toThrow('mascotas validation failed: nombre: El nombre debe tener al menos 2 caracteres');
        });

        it('should fail validation when nombre is too long', async () => {
            const mascotaData = { ...validMascotaData, nombre: 'A'.repeat(51) };
            const mascota = new Mascota(mascotaData);
            await expect(mascota.validate()).rejects.toThrow('mascotas validation failed: nombre: El nombre no puede exceder 50 caracteres');
        });
    });

    describe('Type Validations', () => {
        it('should fail validation when tipo is missing', async () => {
            const mascotaData = { ...validMascotaData };
            delete mascotaData.tipo;
            const mascota = new Mascota(mascotaData);
            await expect(mascota.validate()).rejects.toThrow('mascotas validation failed: tipo: El tipo de mascota es requerido');
        });

        it('should allow valid tipos', async () => {
            const validTipos = ['Perro', 'Gato'];
            for (const tipo of validTipos) {
                const mascota = new Mascota({ ...validMascotaData, tipo });
                await expect(mascota.validate()).resolves.toBeUndefined();
            }
        });

        it('should fail validation when tipo is invalid', async () => {
            const mascotaData = { ...validMascotaData, tipo: 'Pájaro' };
            const mascota = new Mascota(mascotaData);
            await expect(mascota.validate()).rejects.toThrow('mascotas validation failed: tipo: Pájaro no es un tipo de mascota válido');
        });
    });

    describe('Age Validations', () => {
        it('should fail validation when edad is negative', async () => {
            const mascotaData = { ...validMascotaData, edad: -1 };
            const mascota = new Mascota(mascotaData);
            await expect(mascota.validate()).rejects.toThrow('mascotas validation failed: edad: La edad no puede ser negativa');
        });

        it('should fail validation when edad is not an integer', async () => {
            const mascotaData = { ...validMascotaData, edad: 5.5 };
            const mascota = new Mascota(mascotaData);
            await expect(mascota.validate()).rejects.toThrow('mascotas validation failed: edad: La edad debe ser un número entero');
        });

        it('should fail validation when edad is too high', async () => {
            const mascotaData = { ...validMascotaData, edad: 31 };
            const mascota = new Mascota(mascotaData);
            await expect(mascota.validate()).rejects.toThrow('mascotas validation failed: edad: La edad no parece correcta');
        });

        it('should allow undefined edad', async () => {
            const mascotaData = { ...validMascotaData };
            delete mascotaData.edad;
            const mascota = new Mascota(mascotaData);
            const err = mascota.validateSync();
            expect(err).toBeUndefined();
        });

        it('should validate edad as integer', async () => {
            const mascota = new Mascota({ ...validMascotaData, edad: 5.5 });
            const err = mascota.validateSync();
            expect(err.errors.edad.message).toBe('La edad debe ser un número entero');
        });
    });

    describe('Virtual Fields', () => {
        it('should calculate edadHumana correctly for Perro', async () => {
            const mascota = new Mascota({ ...validMascotaData, tipo: 'Perro', edad: 5 });
            expect(mascota.edadHumana).toBe(35); // 5 * 7
        });

        it('should calculate edadHumana correctly for Gato', async () => {
            const mascota = new Mascota({ ...validMascotaData, tipo: 'Gato', edad: 5 });
            expect(mascota.edadHumana).toBe(30); // 5 * 6
        });

        it('should calculate edadHumana correctly for Conejo', async () => {
            const mascota = new Mascota({ ...validMascotaData, tipo: 'Conejo', edad: 5 });
            expect(mascota.edadHumana).toBe(5); // mismo valor
        });

        it('should return null for edadHumana when edad is undefined', async () => {
            const mascotaData = { ...validMascotaData };
            delete mascotaData.edad;
            const mascota = new Mascota(mascotaData);
            expect(mascota.edadHumana).toBeNull();
        });
    });

    describe('Date Validations', () => {
        it('should not allow future fechaAdopcion', async () => {
            const futureDate = new Date();
            futureDate.setFullYear(futureDate.getFullYear() + 1);
            
            const mascotaData = { ...validMascotaData, fechaAdopcion: futureDate };
            const mascota = new Mascota(mascotaData);
            await expect(mascota.validate()).rejects.toThrow('mascotas validation failed: fechaAdopcion: La fecha de adopción no puede ser futura');
        });

        it('should allow past fechaAdopcion', async () => {
            const pastDate = new Date();
            pastDate.setFullYear(pastDate.getFullYear() - 1);
            
            const mascotaData = { ...validMascotaData, fechaAdopcion: pastDate };
            const mascota = new Mascota(mascotaData);
            await expect(mascota.validate()).resolves.toBeUndefined();
        });
    });

    describe('Adoption Date Validations', () => {
        it('should allow null fechaAdopcion', async () => {
            const mascota = new Mascota({ ...validMascotaData, fechaAdopcion: null });
            const err = mascota.validateSync();
            expect(err).toBeUndefined();
        });

        it('should allow undefined fechaAdopcion', async () => {
            const mascotaData = { ...validMascotaData };
            delete mascotaData.fechaAdopcion;
            const mascota = new Mascota(mascotaData);
            const err = mascota.validateSync();
            expect(err).toBeUndefined();
        });

        it('should validate current date for fechaAdopcion', async () => {
            const mascota = new Mascota({ ...validMascotaData, fechaAdopcion: new Date() });
            const err = mascota.validateSync();
            expect(err).toBeUndefined();
        });
    });

    describe('Default Values', () => {
        it('should set default values correctly', () => {
            const mascota = new Mascota(validMascotaData);
            expect(mascota.adoptado).toBe(false);
            expect(mascota.createdAt).toBeUndefined(); // Los timestamps se crean al guardar
            expect(mascota.updatedAt).toBeUndefined(); // Los timestamps se crean al guardar
        });
    });
});
