const multer = require('multer');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 200 * 1024 * 1024
    }
});

module.exports = upload; 