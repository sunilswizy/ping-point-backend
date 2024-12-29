
import { Request, Response, NextFunction } from 'express'

const notFoundHandler = (_req: Request, res: Response, next: NextFunction) => {
  const message = '404 Error: Glitch in the Matrix';

  res.status(404).send(message)
}

export { notFoundHandler }