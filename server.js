import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const path = await import('path');
const fs = await import('fs');

const dev = process.env.NODE_ENV !== "production";
const recordsDirectory = 'records';
const hostname = "localhost";
const port = 3000;
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

// Storing Data of Game Sessions in the server
const gameSessions = new Map();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);
  const gameSessions = new Map();

  io.on("connection", (socket) => {
    console.log("A user connected to websockets");

    //Join the Game Session
    socket.on("join", (data, callback) => {
      const sessionId = data.id;
      console.log(`User joined session: ${sessionId}`);
      socket.join(sessionId);
      const sessionData = gameSessions.get(sessionId);

      if (sessionData === undefined) {
        //Create a new board
        const board = Array(9).fill('');
        gameSessions.set(sessionId, { board: board, currentMove: 'X'});
        console.log('SERVER: New Game data:', gameSessions.get(sessionId));

        // Create a new file to store the game data
        const filePath = path.join(recordsDirectory, `${sessionId}.txt`);
        fs.writeFileSync(filePath, `Game session ID: ${sessionId}\n\n`);
        const fileData = fs.readFileSync(filePath, 'utf8');
        
        callback({ board: board, currentMove: 'X', fileData: fileData});
      }
      else
      {
        const gameBoard = gameSessions.get(sessionId).board;
        const currentMove = gameSessions.get(sessionId).currentMove;
        console.log('SERVER: old Game data:', gameSessions.get(sessionId));

        const filePath = path.join(recordsDirectory, `${data.id}.txt`);
        const fileData = fs.readFileSync(filePath, 'utf8');

        callback({ board: gameBoard, currentMove: currentMove, fileData: fileData});
      }

    });
      

    // Forward Data on update event
    socket.on('update', (data) => {
      // Update the board in the gameSessions map
      gameSessions.set(data.sessionId, { board: data.board, currentMove: data.currentMove, index: data.index});
      console.log('Update received:', data);
      console.log('Updated Game data:', gameSessions);
      
      // Append the move to the file
      const filePath = path.join(recordsDirectory, `${data.sessionId}.txt`);
      const prevMove = data.currentMove === 'X' ? 'O' : 'X';
      fs.appendFileSync(filePath, `${prevMove} moves at index: ${data.index}.\n`);
      const fileData = fs.readFileSync(filePath, 'utf8');
      data.fileData = fileData;

      // Broadcast the updated board to all clients in the session
      io.to(data.sessionId).emit('update', data);
    });

    socket.on("file", (data, callback) => { 
      console.log('File Requested for Session:', data.id);
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