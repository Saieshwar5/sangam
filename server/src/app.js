// server/src/app.js
import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import { socketService } from './services/socketService.js';



import authRouter from './routes/auth/auth.js';
import profileRouter from './routes/profile/profile.js';
import groupsRouter from './routes/groups/groups.js';
import PostsRouter from './routes/posts/createPost.js';
import loadMembersRouter from './routes/members/loadMembers.js';
import messageRoutes from './routes/messages/messageRoutes.js';
import chatUsersRoutes from './routes/chatUsers/chatUsers.js';
import commentsRouter from './routes/comments/comments.js';
import { syncModels } from './models/associations.js';

dotenv.config();

export async function bootstrapServer() {
  const app = express();
  const server = http.createServer(app);

  app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use('/api/auth', authRouter);
  app.use('/api/profile', profileRouter);
  app.use('/api/groups', groupsRouter);
  app.use('/api/posts', PostsRouter);
  app.use('/api/group', loadMembersRouter);
  app.use('/api/messages', messageRoutes);
  app.use('/api/chat', chatUsersRoutes);
  app.use('/api/comments', commentsRouter);

  app.get('/', (req, res) => {
    res.send('Hello World');
  });

  await syncModels();
  socketService.initialize(server);

  return server;
}