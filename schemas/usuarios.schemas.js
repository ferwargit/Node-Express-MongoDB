import mongoose from "mongoose";

const usuariosSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, 'El email es requerido'],
            unique: true,
            trim: true,
            lowercase: true,
            match: [
                /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
                'Por favor ingrese un email válido'
            ]
        },
        nombre: {
            type: String,
            required: [true, 'El nombre es requerido'],
            trim: true,
            minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
            maxlength: [50, 'El nombre no puede exceder 50 caracteres']
        },
        telefono: {
            type: String,
            required: [true, 'El teléfono es requerido'],
            trim: true,
            match: [
                /^\+?[1-9]\d{1,14}$/,
                'Por favor ingrese un número de teléfono válido'
            ]
        },
        clave: {
            type: String,
            required: [true, 'La clave es requerida'],
            minlength: [8, 'La clave debe tener al menos 8 caracteres'],
            validate: {
                validator: function(value) {
                    // Al menos una mayúscula, una minúscula, un número y un caracter especial
                    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(value);
                },
                message: 'La clave debe contener al menos una mayúscula, una minúscula, un número y un caracter especial'
            }
        },
        rol: {
            type: String,
            enum: {
                values: ['admin', 'usuario'],
                message: '{VALUE} no es un rol válido'
            },
            default: 'usuario'
        },
        activo: {
            type: Boolean,
            default: true
        },
        ultimoAcceso: {
            type: Date,
            default: Date.now
        }
    }, 
    { 
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Virtual para obtener el nombre completo
usuariosSchema.virtual('nombreCompleto').get(function() {
    return this.nombre.trim();
});

// Método para verificar si el usuario es administrador
usuariosSchema.methods.esAdmin = function() {
    return this.rol === 'admin';
};

export default mongoose.model('usuarios', usuariosSchema);