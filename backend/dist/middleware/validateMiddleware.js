"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const validate = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errorMessages = error.errors.map(issue => ({
                    message: `${issue.path.join('.')} is ${issue.message.toLowerCase()}`,
                }));
                res.status(400).json({ success: false, error: 'Invalid input', details: errorMessages });
            }
            else {
                res.status(500).json({ success: false, error: 'Internal Server Error' });
            }
        }
    };
};
exports.validate = validate;
