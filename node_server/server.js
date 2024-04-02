const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const path = require('path');

// Define the directory where game records will be stored
const recordsDirectory = path.join(__dirname, 'records');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 5000;
const HOST = '0.0.0.0';
const gameSessions = new Map();

io.on('connection', (socket) => {
    console.log('A user connected');

    // // Join the specified room or channel
    // socket.join(sessionId);

    // if (!gameSessions.has(sessionId)) {
    //     //Initailize a new game session
    //     gameSessions.set(sessionId,  {board:[]});

    //     //Add Text file for persistent storage
    //     const filePath = path.join(recordsDirectory, `${sessionId}.txt`);
    //     fs.writeFileSync(filePath, `Game session ID: ${sessionId}\n\n`);
    // }

    // Handle disconnections
    socket.on('disconnect', () => {
  
    });

    // Handle updates
    socket.on('update', () => {
        // Update the board in the gameSessions map
        //gameSessions.set(sessionId, { board: updatedBoard });
        console.log('Update received');
        // Broadcast the updated board to all clients in the session
        //io.to(sessionId).emit('update', updatedBoard);
    });
    
});

server.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}/`);
  });
