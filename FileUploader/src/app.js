require('dotenv').config();

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');

const uploadRoutes = require('./routes/upload');
const errorHandler = require('./middleware/error');
const ssrfProtection = require('./middleware/BlacklistIp/ssrfProtection');
const AllRoutes = require('./routes/AllRoutes');

const app = express();
const PORT = process.env.PORT || 3002;

app.set('trust proxy', 1);

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again later.',
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many requests from this IP, please try again later.'
        });
    }
});

const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            'http://localhost:3000', 
            'http://localhost:3001',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:3001',
            'https://spotlight.medzyamara.dev',
            'https://aws.medzyamara.dev',
            'http://192.168.1.92:3000',
        ];
        
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'access-token', 'Origin', 'X-Requested-With', 'Accept'],
    credentials: true,
    maxAge: 86400,
    preflightContinue: false,
    optionsSuccessStatus: 204
};

const securityHeaders = (req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
}

app.use(bodyParser.json({
    limit: '200mb'
}));

app.use(bodyParser.urlencoded({
    limit: '200mb',
    extended: true
}));

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(securityHeaders);
app.use(limiter);
app.use(ssrfProtection);
app.use('*', AllRoutes);
app.use('/upload', uploadRoutes);

app.use((err, req, res, next) => {
    errorHandler(err, req, res, next);
    
    const origin = req.headers.origin;
    if (corsOptions.origin === '*' || (typeof corsOptions.origin === 'function' && 
        corsOptions.origin(origin, (err, allow) => allow))) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Credentials', true);
        res.header('Access-Control-Allow-Methods', corsOptions.methods.join(','));
        res.header('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(','));
    }
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = { app, PORT };