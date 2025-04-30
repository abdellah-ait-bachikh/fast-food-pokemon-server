"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUpdateCategory = exports.validateCreateCategory = void 0;
const zod_1 = require("zod");
const validateCreateCategory = (category) => {
    const schema = zod_1.z.object({
        name: zod_1.z
            .string({ message: "Nome de category est chain de caractére" })
            .trim()
            .min(3, { message: "Le nom doit contenir au moins 3 caractères." })
            .max(90, { message: "Le nom doit contenir au maximum 90 caractères." })
            .regex(/^[\p{L}\p{N}\s\u0600-\u06FF]+$/u, {
            message: "Le nom peut contenir uniquement des lettres (accentuées ou non), des chiffres et des espaces.",
        }),
        position: zod_1.z
            .number({ invalid_type_error: "Position doit être un nombre." })
            .int({ message: "Position doit être un entier." })
            .min(0, { message: "Position doit être positive." })
            .optional()
            .default(0),
    });
    const result = schema.safeParse({
        name: category.name,
        position: category.position,
    });
    if (!result.success) {
        const errors = result.error.flatten();
        return {
            errors: {
                name: errors.fieldErrors.name || [],
                position: errors.fieldErrors.position || [],
            },
            data: null,
        };
    }
    return { errors: null, data: result.data };
};
exports.validateCreateCategory = validateCreateCategory;
const validateUpdateCategory = (category) => {
    const schema = zod_1.z.object({
        name: zod_1.z
            .string({
            required_error: "Le nom est requis.",
            invalid_type_error: "Le nom doit être une chaîne de caractères.",
        })
            .trim()
            .min(3, { message: "Le nom doit contenir au moins 3 caractères." })
            .max(90, { message: "Le nom doit contenir au maximum 90 caractères." })
            .regex(/^[\p{L}\p{N}\s\u0600-\u06FF]+$/u, {
            message: "Le nom peut contenir uniquement des lettres (accentuées ou non), des chiffres et des espaces.",
        }),
        position: zod_1.z
            .number({ invalid_type_error: "Position doit être un nombre." })
            .int({ message: "Position doit être un entier." })
            .min(0, { message: "Position doit être positive." })
            .default(0),
    });
    const result = schema.safeParse({
        name: category.name,
        position: category.position,
    });
    if (!result.success) {
        const errors = result.error.flatten();
        return {
            data: null,
            errors: {
                name: errors.fieldErrors.name || [],
                position: errors.fieldErrors.position || [],
            },
        };
    }
    return { errors: null, data: result };
};
exports.validateUpdateCategory = validateUpdateCategory;
