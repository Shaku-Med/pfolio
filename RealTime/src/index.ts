import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import Router from './Router/Router.js';
import { initializeSocket } from './socket/socket.js';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true, limit: `2tb` }));

app.use(Router);

const server = createServer(app);
initializeSocket(server);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});