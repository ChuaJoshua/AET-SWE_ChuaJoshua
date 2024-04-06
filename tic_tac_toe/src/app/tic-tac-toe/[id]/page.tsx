"use client";

import { useRef, useEffect, useState } from 'react';
import MySquare from './components/square';
import socketIOClient from 'socket.io-client';
import { io } from 'socket.io-client';
import axios from 'axios';

export const socket = io();
  
// Reference some functions from: https://react.dev/learn/tutorial-tic-tac-toe

export default function Game({ params }: { params: { id: string } }) {

    const { id } = params; // Destructure id from params object
    const [squares, setSquares] = useState<string[]>(Array(9).fill(''));
    const [currentMove, setCurrentMove] = useState(0);
    const [gameEnded, setGameEnded] = useState(false);
    const xIsNext = currentMove % 2 === 0;
    const [isConnected, setIsConnected] = useState(false);
    const [transport, setTransport] = useState("N/A");

    useEffect(() => {
        document.title = "Game "+ id + " - Tic Tac Toe";
        console.log('Game page loaded');
        console.log(params);
        getBoard();

        if (socket.connected) {
            onConnect();
          }
      
          function onConnect() {
            setIsConnected(true);
            setTransport(socket.io.engine.transport.name);
      
            socket.io.engine.on("upgrade", (transport) => {
              setTransport(transport.name);
            });

            socket.on('update', (data) => {
                console.log('Received Update');
                if (data.sessionId === id){
                    setSquares(data.board);
                    setCurrentMove(currentMove + 1);
                    console.log('Updating Board');
                };
            });
          
          }

          function onDisconnect() {
            setIsConnected(false);
            setTransport("N/A");
          }
      
          socket.on("connect", onConnect);
          socket.on("disconnect", onDisconnect);
      
          return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
          };

    }, []);

    useEffect(() => {
        if (calculateWinner(squares)) {
            setGameEnded(true);
        }
        else if (currentMove === 9) {
            setGameEnded(true);
        }
    }, [currentMove, squares]);

    function handleClick(index: number) {
        if(squares[index] === '' && !calculateWinner(squares)) {
            const nextSquares = squares.slice();
            if (xIsNext) {
                nextSquares[index] = 'X';
            } else {
                nextSquares[index] = 'O';
            }
            setSquares(nextSquares);
            if (socket)
            {
                socket.emit('update', { board: nextSquares, sessionId: id });
                //socket.emit('update');
                console.log('Sending Update');
            }
            
        }
        else
        {
            alert('Invalid Move');
            console.log(squares[1], calculateWinner(squares));
        }
    }

    function restartGame()
    {
        setCurrentMove(0);
        setSquares(Array(9).fill(''));
        setGameEnded(false);
    }

    function getBoard()
    { 
        axios.get(`http://localhost:5000/game/${id}`)
        .then(response => {
            console.log("Initialise Board" ,response.data.board);
            setSquares(response.data.board);
        })
        .catch(error => {
            console.error('Error fetching game state:', error);
    });
    }

    //Calculate winner 
    function calculateWinner(squares : string[]) {
        const lines = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],

            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            
            [0, 4, 8],
            [2, 4, 6],
        ];

        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return squares[a];
            }
        }
        return null;
    }
      


   return  (
    <div className="bg-white lg:flex lg:justify-center lg:pt-5 w-full min-h-screen items-center">
        <div className="flex flex-col px-6 py-12 bg-white items-center">
            <h1 className="text-3xl font-bold pb-10">Tic Tac Toe</h1>
            <div className="mb-4 text-xl font-bold">
                {calculateWinner(squares) ? (
                    `Winner: ${calculateWinner(squares)}`
                ) : currentMove === 9 ? (
                    'Match Draw'
                ) : (
                    `Player ${xIsNext ? 'X' : 'O'}'s Move`
                )}
            </div> 
            <div className="flex flex-col">
                <div className="flex flex-row">
                    <MySquare value={squares[0]} onClick={() => handleClick(0)}/>
                    <MySquare value={squares[1]} onClick={() => handleClick(1)}/> 
                    <MySquare value={squares[2]} onClick={() => handleClick(2)}/> 
                </div>
                <div className="flex flex-row">
                    <MySquare value={squares[3]} onClick={() => handleClick(3)}/>
                    <MySquare value={squares[4]} onClick={() => handleClick(4)}/> 
                    <MySquare value={squares[5]} onClick={() => handleClick(5)}/> 
                </div>
                <div className="flex flex-row">
                    <MySquare value={squares[6]} onClick={() => handleClick(6)}/>
                    <MySquare value={squares[7]} onClick={() => handleClick(7)}/> 
                    <MySquare value={squares[8]} onClick={() => handleClick(8)}/> 
                </div>
            </div>
            <div>
            {gameEnded ? (
                <div className="bg-slate-950 text-white p-2 m-2 rounded-lg" onClick={() => restartGame()}>Restart Game</div>
            ) : null}
            </div>    
        </div>
    </div>
    );
}