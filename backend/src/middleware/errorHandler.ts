import { Request, Response, NextFunction } from 'express';
import { AxiosError } from 'axios';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  if (err instanceof AxiosError) {
    if (err.response?.status === 401) {
      return res.status(401).json({
        success: false,
        errorMessage: 'API key is invalid or expired'
      });
    }
    if (err.response?.status === 429) {
      return res.status(429).json({
        success: false,
        errorMessage: 'Too many requests, please try again later'
      });
    }
    return res.status(500).json({
      success: false,
      errorMessage: 'AI service is temporarily unavailable. Please try again later.'
    });
  }

  res.status(500).json({
    success: false,
    errorMessage: 'Internal server error'
  });
}; 