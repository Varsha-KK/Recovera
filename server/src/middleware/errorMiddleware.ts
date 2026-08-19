import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Handle Malformed JSON parsing errors from express.json() / body-parser
  if (
    err instanceof SyntaxError &&
    (err.status === 400 || err.statusCode === 400 || 'body' in err || err.type === 'entity.parse.failed')
  ) {
    res.status(400).json({
      success: false,
      message: 'Invalid JSON request body.',
    });
    return;
  }

  console.error('🔥 [Server Error]:', err.message || err);

  const statusCode = err.statusCode || err.status || (res.statusCode === 200 ? 500 : res.statusCode);
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
  });
};

export default { errorHandler, notFoundHandler };
