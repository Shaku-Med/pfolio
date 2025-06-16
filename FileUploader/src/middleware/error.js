const errorHandler = (err, req, res, next, status = 500) => {
    // console.error(err.stack);
    res.status(status).json({
        success: false,
        message: err ? err?.message : `Something went wrong!`,
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
};

module.exports = errorHandler; 