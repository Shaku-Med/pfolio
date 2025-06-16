import { Router, Request, Response } from 'express';
import { DecryptCombine } from '../../Lock/Combine.js';
import { getClientIP } from '../../Lock/GetIp.js';
import { encrypt } from '../../Lock/Enc.js';
import { destroy } from '../utils/destroy.js';

const router = Router();

/**
 * Handles token verification and generation
 * @route GET /
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const headers = req.headers;
        const userAgent = headers['user-agent']?.split(/\s+/).join('');
        const clientIP = await getClientIP({ get: headers });

        if (!headers.authorization || !userAgent || !clientIP) {
            destroy(req, res);
            return;
        }

        const token = headers.authorization.split(' ')[1];

        if (!token) {
            destroy(req, res, 401, {
                message: 'You\'re not allowed to make this request.',
                status: 401,
                requestDate: new Date().toLocaleDateString(),
                ip: clientIP,
            });
            return;
        }

        const check = DecryptCombine(token, [`${process.env.REQUEST_TOKEN}`]);

        if (!check) {
            destroy(req, res, 401, {
                message: 'Your request was not valid. Please try again later.',
                status: 401,
                requestDate: new Date().toLocaleDateString(),
                ip: clientIP,
            });
            return;
        }

        if (check[0] === clientIP) {
            const date = new Date();
            const newToken = encrypt(JSON.stringify({
                ip: clientIP,
                created_at: date.toLocaleDateString(),
                expires_at: date.setHours(date.getHours() + 1),
                user_agent: userAgent,
            }), `${process.env.SOCKET_ID_2}`);

            destroy(req, res, 200, {
                message: 'You\'re now verified.',
                status: 200,
                requestDate: new Date().toLocaleDateString(),
                token: newToken,
            });
            return;
        }

        destroy(req, res, 401, {
            message: 'Oups! We almost verified you there but something went wrong.',
            status: 401,
            requestDate: new Date().toLocaleDateString(),
            ip: clientIP,
        });
    } catch (error) {
        console.error('Token verification error:', error);
        destroy(req, res);
    }
});

export default router; 