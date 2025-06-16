import { Request, Response } from 'express';

/**
 * Utility function to handle request destruction and response sending
 * @param req - Express request object
 * @param res - Express response object
 * @param status - Optional HTTP status code
 * @param message - Optional response message (string or object)
 */
export const destroy = (
    req: Request, 
    res: Response, 
    status?: number, 
    message?: string | object
): void => {
    try {
        if (status) {
            if (typeof message === 'string') {
                res.status(status).send(message);
            } else {
                res.status(status).json(message);
            }
            return;
        }
        
        req.destroy();
        res.destroy();
    } catch {
        req.destroy();
        res.destroy();
    }
}; 