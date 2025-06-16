import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

// This is a generic middleware function that takes a Zod schema.
export const validate = (schema: z.ZodObject<any, any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate the request body against the provided schema.
      schema.parse(req.body);
      // If validation is successful, proceed to the next middleware/controller.
      next();
    } catch (error) aney {
      // If validation fails, check if it's a ZodError.
      if (error instanceof ZodError) {
        // Map the Zod errors to a more user-friendly format.
        const errorMessages = error.errors.map(issue => ({
          message: `${issue.path.join('.')} is ${issue.message.toLowerCase()}`,
        }));
        // Respond with a 400 Bad Request status and the validation errors.
        res.status(400).json({ success: false, error: 'Invalid input', details: errorMessages });
      } else {
        // For any other type of error, respond with a generic 500 status.
        res.status(500).json({ success: false, error: 'Internal Server Error' });
      }
    }
  };
};
