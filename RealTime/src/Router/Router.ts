import { Router } from 'express';
import tokenRouter from './routes/token.js';

const router = Router();

/**
 * Health check endpoint
 * @route GET /
 */
router.get('/', (req, res) => {
    res.send('Hello YO');
});

// Mount token routes
router.use('/token', tokenRouter);

export default router;