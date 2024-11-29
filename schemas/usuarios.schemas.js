import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Joi from "joi";

// Esquema completo para validación de teléfono
const phoneJoiSchema = Joi.string()
    .required()
    .pattern(/^(011|11)[\s-]?\d{4}[\s-]?\d{4}$/)
    .messages({
        'string.base': 'El teléfono debe ser una cadena de texto',
        'string.empty': 'El teléfono es requerido',
        'any.required': 'El teléfono es requerido',
        'string.pattern.base': 'Por favor ingrese un número de teléfono válido (ej: 011 1234 5678)'
    });

// Función de validación de teléfono
const validatePhone = function(value) {
    console.log('\n=== Inicio Validación del Teléfono ===');
    console.log('Valor recibido:', value);
    
    // Si el valor es null o undefined
    if (value === null || value === undefined) {
        console.log('Error: Valor null o undefined');
        console.log('=== Fin Validación del Teléfono con Error ===\n');
        return false;
    }

    // Intentar convertir a string si no es string
    try {
        if (typeof value !== 'string') {
            value = String(value);
        }
        console.log('Tipo:', typeof value);
    } catch (error) {
        console.log('Error al convertir a string:', error.message);
        console.log('=== Fin Validación del Teléfono con Error ===\n');
        return false;
    }

    // Trim del valor
    value = value.trim();
    console.log('Valor después de trim:', value);
    
    // Verificar si está vacío después del trim
    if (value === '') {
        console.log('Error: String vacío después de trim');
        console.log('=== Fin Validación del Teléfono con Error ===\n');
        return false;
    }

    // Validar con Joi
    console.log('Validando con Joi:', value);
    const schema = Joi.string().pattern(/^(011|11)[ -]?\d{4}[ -]?\d{4}$/);
    const { error } = schema.validate(value);
    
    if (error) {
        console.log('Error de Joi:', error.message);
        console.log('=== Fin Validación del Teléfono con Error ===\n');
        return false;
    }

    console.log('Validación exitosa');
    console.log('=== Fin Validación del Teléfono ===\n');
    return true;
};

const usuariosSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es requerido'],
        minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
        maxlength: [50, 'El nombre no puede tener más de 50 caracteres']
    },
    apellido: {
        type: String,
        required: [true, 'El apellido es requerido']
    },
    email: {
        type: String,
        required: [true, 'El email es requerido'],
        unique: true,
        validate: {
            validator: function(v) {
                return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
            },
            message: props => 'Por favor ingrese un email válido'
        }
    },
    telefono: {
        type: String,
        required: [true, 'El teléfono es requerido'],
        validate: {
            validator: validatePhone,
            message: props => {
                if (!props.value || props.value.trim() === '') {
                    return 'El teléfono es requerido';
                }
                return 'Por favor ingrese un número de teléfono válido (ej: 011 1234 5678)';
            }
        }
    },
    clave: {
        type: String,
        required: [true, 'La clave es requerida'],
        validate: {
            validator: function(v) {
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(v);
            },
            message: props => 'La clave debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial'
        }
    },
    rol: {
        type: String,
        enum: {
            values: ['admin', 'usuario'],
            message: 'El rol debe ser admin o usuario'
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
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual para obtener el nombre completo
usuariosSchema.virtual('nombreCompleto').get(function() {
    if (!this.nombre) return '';
    return this.nombre.trim();
});

// Método para verificar si el usuario es administrador
usuariosSchema.methods.esAdmin = function() {
    return this.rol === 'admin';
};

export default mongoose.model('usuarios', usuariosSchema);