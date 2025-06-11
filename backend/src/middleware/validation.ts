import { Request, Response, NextFunction } from 'express';
import { GenerateFieldRequest } from '../types/requests';

export const validateGenerateFieldRequest = (req: Request, res: Response, next: NextFunction) => {
  const { field, context } = req.body as GenerateFieldRequest;

  if (!field) {
    return res.status(400).json({
      success: false,
      errorMessage: 'Field is required'
    });
  }

  if (!context || typeof context !== 'object') {
    return res.status(400).json({
      success: false,
      errorMessage: 'Context must be an object'
    });
  }

  next();
}; 