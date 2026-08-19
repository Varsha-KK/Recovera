import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Handle malformed JSON parsing errors from express.json() / body-parser
  if (err instanceof SyntaxError) {
    const parseError = err as SyntaxError & {
      status?: number;
      statusCode?: number;
      type?: string;
      body?: unknown;
    };

    if (
      parseError.status === 400 ||
      parseError.statusCode === 400 ||
      'body' in parseError ||
      parseError.type === 'entity.parse.failed'
    ) {
      res.status(400).json({
        success: false,
        message: 'Invalid JSON request body.',
      });
      return;
    }
  }

  const error = err as {
    message?: string;
    statusCode?: number;
    status?: number;
  };

  console.error('🔥 [Server Error]:', error.message || err);

  const statusCode =
    error.statusCode ||
    error.status ||
    (res.statusCode === 200 ? 500 : res.statusCode);

  res.status(statusCode).json({
    success: false,
    message: error.message || 'Internal Server Error',
  });
};

export const notFoundHandler = (
  req: Request,
  res: Response
): void => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
  });
};

export default {
  errorHandler,
  notFoundHandler,
};