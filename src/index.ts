import dotenv from "dotenv";
import express, { Express, Request, Response, NextFunction } from "express";
import { createServer } from "http";
import helmet from "helmet";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import { Server } from 'socket.io';
import requestRoutes from "./routes/requestRoutes";
import cookieParser from "cookie-parser";
import { staticRoutes } from "./middlewares/staticFileMiddleware";
import path from "path";
import mongoose from "mongoose";
import User, { IAddress, IUser } from "./models/user";

import { connectDB } from "./config/database";
import { config } from "./config/config";

dotenv.config();

const app: Express = express();
const server = createServer(app);
const port = 5000;
const io = new Server(server);
export { io };
app.use(cors());
app.use(helmet());
connectDB();
app.use(cookieParser());
app.use(express.json());

app.use(
  cors({
    origin: config.ALLOWED_DOMAINS?.split(" "),
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

const routes = [
    authRoutes,
    requestRoutes
];
routes?.forEach((router) => app.use("/api/rakt", router));
staticRoutes?.forEach((route) =>
  app.use(route.route, express.static(path.join(__dirname, route.dir)))
);

app.get('/api', (req, res) => {
  res.send('Hello from Ankush');
});
//Socket connection
// io.on('connection', (socket) => {
//   socket.on('register', async (userId) => {
//     try {
//         const updatedUser = await User.findOneAndUpdate(
//             { userId },
//             { socketId: socket.id },
//             { new: true }
//         );

//         if (updatedUser) {
//             console.log(`User ${userId} connected with socket ID ${socket.id}`);
//         } else {
//             console.log(`User with userId ${userId} not found`);
//         }
//     } catch (error) {
//         console.error('Error updating socketId:', error);
//     }
// });
//   socket.on('disconnect', async () => {
//       console.log('Client disconnected');

//       await User.findOneAndUpdate(
//           { socketId: socket.id },
//           { socketId: null },
//           { new: true }
//       );
//   });
// });

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});