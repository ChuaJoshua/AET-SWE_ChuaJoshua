"use client";

import { useRef, useEffect, useState } from 'react';
import MySquare from './components/square';
import socketIOClient from 'socket.io-client';
import { io } from 'socket.io-client';

export const socket = io();
  
// Reference some functions from: https://react.dev/learn/tutorial-tic-tac-toe

export default function Game({ params }: { params: { id: string } }) {

    const { id } = params; // Destructure id from params object
    const [squares, setSquares] = useState<string[]>(Array(9).fill(''));
    const [currentMove, setCurrentMove] = useState('X');
    const [isConnected, setIsConnected] = useState(false);
    const [transport, setTransport] = useState("N/A");
    const [records, setRecords] = useState("");

    useEffect(() => {
        document.title = "Game "+ id + " - Tic Tac Toe";
        console.log('Game page loaded');
        console.log(params);

        if (socket.connected) {
            onConnect();
          }
      
          function onConnect() {
            setIsConnected(true);
            setTransport(socket.io.engine.transport.name);

            socket.on('update', (data): void => {
                setSquares(data.board);
                setCurrentMove(data.currentMove);
                setRecords(data.fileData);
                console.log('Received Update: ', data.currentMove);
            });

            socket.emit('join', { id: id }, (response: { board: string[], currentMove: string , fileData: string}) => {
                // Server has acknowledged 'join' event
                // 'response' should include the game data
                if (response.board && response.currentMove) {
                    setSquares(response.board);
                    setCurrentMove(response.currentMove);
                    setRecords(response.fileData);
                }
            });
      
            socket.io.engine.on("upgrade", (transport) => {
              setTransport(transport.name);
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
            socket.off("disconnect", onDisconnect)
            socket.off('update');
          };

    }, []);

    function handleClick(index: number) {
        if(squares[index] === '' && !calculateWinner(squares)) {
            const nextSquares = squares.slice();
            nextSquares[index] = currentMove;
            const nextMove = currentMove === 'X' ? 'O' : 'X';

            setCurrentMove(nextMove);
            setSquares(nextSquares);

            if (socket)
            {
                console.log('Sending Update WHERE', { board: nextSquares, sessionId: id, currentMove: nextMove, index: index });
                socket.emit('update', { board: nextSquares, sessionId: id, currentMove: nextMove, index: index });
            }
            
        }
        else
        {
            alert('Invalid Move');
            console.log(squares[1], calculateWinner(squares));
        }
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

    function calculateDraw(squares : string[]) {
        return (squares.every(square => square !== '') ? true : false);
        
    }

    if (squares == null) {
        return (
        <div className="bg-white lg:flex lg:justify-center lg:pt-5 w-full min-h-screen items-center">
            <div className="flex flex-col px-6 py-12 bg-white items-center">
                <h1 className="text-3xl font-bold pb-10">Loading ...</h1>
            </div>
        </div>
        )
    }

return (
    <div className="bg-white lg:flex lg:justify-center lg:pt-5 w-full min-h-screen items-center">
        <div className="flex flex-col px-6 py-12 bg-white items-center">
            <h1 className="text-3xl font-bold pb-10">Tic Tac Toe</h1>
            <div className="mb-4 text-xl font-bold">
                {calculateWinner(squares) ? (
                    `Winner: ${calculateWinner(squares)}`
                ) : calculateDraw(squares) ? (
                    'Match Draw'
                ) : (
                    `Currently, Player ${currentMove}'s Move`
                )}
            </div>
            <div className="flex flex-row">
                <div className="bg-slate-950 text-white p-5 mr-10 rounded-lg">
                    <h3 className="text-lg font-bold">{records !== "" ? 'Game records' : 'No Game records'}</h3>
                    <pre className="text-sm">{records}</pre>
                </div>
                <div className="flex flex-col">
                    <div className="flex flex-row">
                        <MySquare value={squares[0]} onClick={() => handleClick(0)} />
                        <MySquare value={squares[1]} onClick={() => handleClick(1)} />
                        <MySquare value={squares[2]} onClick={() => handleClick(2)} />
                    </div>
                    <div className="flex flex-row">
                        <MySquare value={squares[3]} onClick={() => handleClick(3)} />
                        <MySquare value={squares[4]} onClick={() => handleClick(4)} />
                        <MySquare value={squares[5]} onClick={() => handleClick(5)} />
                    </div>
                    <div className="flex flex-row">
                        <MySquare value={squares[6]} onClick={() => handleClick(6)} />
                        <MySquare value={squares[7]} onClick={() => handleClick(7)} />
                        <MySquare value={squares[8]} onClick={() => handleClick(8)} />
                    </div>
                </div>
            </div>
        </div>
    </div>
);
}