const { app, PORT } = require('./src/app');

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
