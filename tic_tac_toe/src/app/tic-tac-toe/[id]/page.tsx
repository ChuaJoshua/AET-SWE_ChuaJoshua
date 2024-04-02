"use client";

import { useEffect, useState } from 'react';
import MySquare from './components/square';
import socketIOClient from 'socket.io-client';

// Reference some functions from: https://react.dev/learn/tutorial-tic-tac-toe

export default function Game({ params }: { params: { id: string } }) {

    const { id } = params; // Destructure id from params object
    const [squares, setSquares] = useState<string[]>(Array(9).fill(''));
    const [currentMove, setCurrentMove] = useState(0);
    const [gameEnded, setGameEnded] = useState(false);
    const xIsNext = currentMove % 2 === 0;

    useEffect(() => {
        document.title = "Game "+ id + " - Tic Tac Toe";
        console.log('Game page loaded');
        console.log(params);
    }, []);

    useEffect(() => {
        if (calculateWinner(squares)) {
            setGameEnded(true);
        }
        else if (currentMove == 9) {
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
            setCurrentMove(currentMove + 1);
        }
        else
        {
            alert('Invalid Move');
        }
    }

    function restartGame()
    {
        setCurrentMove(0);
        setSquares(Array(9).fill(''));
        setGameEnded(false);
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