import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import express from "express";
import cors from "cors";
import { callbackify } from "node:util";

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
        socket.emit('update', { sessionId, board });
        callback({ board: board })
      }
      else
      {
        const gameBoard = gameSessions.get(sessionId).board;
        const currentMove = gameSessions.get(sessionId).currentMove;
        console.log('SERVER: New Game data:', gameSessions.get(sessionId));
        socket.emit('update', { sessionId, board: gameBoard, currentMove: currentMove});
        callback({ board: gameBoard })
      }
    });
      

    // Forward Data on update event
    socket.on('update', (data) => {
      // Update the board in the gameSessions map
      gameSessions.set(data.sessionId, { board: data.board, currentMove: data.currentMove});
      console.log('Update received:', data);
      console.log('Updated Game data:', gameSessions);
      
      // Broadcast the updated board to all clients in the session
      io.to(data.sessionId).emit('update', data);
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