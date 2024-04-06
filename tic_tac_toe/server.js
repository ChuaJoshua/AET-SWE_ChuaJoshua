import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import express from "express";
import cors from "cors";

const path = await import('path');
const fs = await import('fs');

const recordsDirectory = 'records';
const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

const server = express();
const serverPort = 5000;

const gameSessions = new Map();

server.use(cors());

server.get('/game/:sessionId', (req, res) => {
    const sessionId = req.params.sessionId;
    console.log('Game data:', gameSessions);
    // Check if game session exists
    if (gameSessions.has(sessionId)) {
        // Get the current game state for the session
        const gameState = gameSessions.get(sessionId);
        console.log('Game id:', sessionId);
        console.log('Game state:', gameState);
        // Send the game state as JSON
        res.json(gameState);
    }
    else if (!gameSessions.has(sessionId)) {
        // Get the current game state for the session
        gameSessions.set(sessionId,  { board:['','','','','','','','',''] });
        const filePath = path.join(recordsDirectory, `${sessionId}.txt`);
        fs.writeFileSync(filePath, `Game session ID: ${sessionId}\n\n`);
        console.log('New Game state:', gameSessions.get(sessionId));
        // Send the game state as JSON
        res.json(gameSessions.get(sessionId));
    } else {
        // Game session not found, return an error
        res.status(404).json({ error: 'Game session not found' });
    }
});

server.listen(serverPort, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);
  const gameSessions = new Map();

  io.on("connection", (socket) => {
    console.log("A user connected to websockets");


    // Forward Data on update event
    socket.on('update', (data) => {
      // Update the board in the gameSessions map
      gameSessions.set(data.sessionId, { board: data.board });
      console.log('Update received:', data);
      console.log('Game data:', gameSessions);
      
      
      // Broadcast the updated board to all clients in the session
      io.emit('update', data);
  });

  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});