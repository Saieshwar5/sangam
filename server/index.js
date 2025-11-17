// server/index.js
import { bootstrapServer } from './src/app.js';

const PORT = process.env.PORT || 4000;

bootstrapServer()
  .then(server => {
    server.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`🔌 Socket.IO server is ready for connections`);
    });
  })
  .catch(error => {
    console.error('❌ Failed to start the server:', error);
    process.exit(1);
  });