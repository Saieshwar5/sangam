import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import profileRouter from './src/routes/profile/profile.js';
import groupsRouter from './src/routes/groups/createGroups.js';
import signUpRouter from './src/routes/auth/signUp.js';
import signInRouter from './src/routes/auth/signIn.js';
import signOutRouter from './src/routes/auth/signOut.js';
import createPostRouter from './src/routes/posts/createPost.js';
import joinGroupRouter from './src/routes/groups/joinGroup.js';
import loadGroupsRouter from './src/routes/groups/loadGroups.js';

import loadMembersRouter from './src/routes/members/loadMembers.js';
import loadPostsRouter from './src/routes/posts/loadPosts.js';

// ✅ Import model associations and sync function
import { syncModels } from './src/models/associations.js';

dotenv.config();

const app = express();
const server = http.createServer(app);


app.use(cors(
    {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',  // Your Next.js URL
        credentials: true,  // ✅ Allow cookies to be sent
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }
));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Mount profile router with multer middleware
app.use('/api', profileRouter);
app.use('/api', groupsRouter);
app.use('/api', signUpRouter);
app.use('/api', signInRouter);

app.use('/api', signOutRouter);
app.use('/api', createPostRouter);
app.use('/api', joinGroupRouter);
app.use('/api', loadGroupsRouter);
app.use('/api', loadMembersRouter);
app.use('/api', loadPostsRouter);
app.get('/', (req, res) => {
    res.send('Hello World');
});

// ✅ Sync database models before starting server
syncModels().then(() => {
    server.listen(process.env.PORT, () => {
        console.log(`🚀 Server is running on port ${process.env.PORT}`);
        console.log(`🔌 Socket.IO server is ready for connections`);
    });
}).catch((error) => {
    console.error('❌ Failed to sync models:', error);
    process.exit(1);
});