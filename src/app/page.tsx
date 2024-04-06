"use client"

import { useState } from "react";

export default function Home() {

  const [userInput, setUserInput] = useState("");
  const handleJoinSession = () => {
    if (!isNaN(parseInt(userInput))) {
      window.location.href = "/tic-tac-toe/" + userInput;
    } else {
      alert("Invalid input");
    }
  }

  return (
    <div className="bg-white flex items-center justify-center lg:pt-5 w-full min-h-screen">
      <div className="flex flex-col px-6 py-12 bg-white lg:w-1/3 lg:border lg:shadow-md h-fit">
        <div className="text-black text-4xl font-bold font-serif text-center">
          Tic Tac Toe Lobby
        </div>
        <div className="text-slate-950 text-lg text-center p-1">
        <div className="text-slate-950 text-lg text-center p-1">
            Instructions:
            <ul className="list-disc list-inside text-left">
              <li>2 Players, "X" and "O"</li>
              <li>Takes turns to place thier marks on a 3 by 3 grid.</li>
              <li>The Goal is the get 3 symbols in a row on the grid.</li>
              <li>Enter a Session ID and click "Join Session" to proceed.</li>
            </ul>
          </div>
        </div>
        <input
          type="Number"
          name="Room Number"
          placeholder="Room Number"
          className="border-b-2 border-primary p-2 m-2 text-black"
          value={userInput}
          onChange={(input) => setUserInput(input.target.value)}
        ></input>
        
        <div className="bg-black text-white  font-bold p-2 m-2 rounded-lg" onClick={handleJoinSession}>
          Join Session
        </div>

        

      </div>
    </div>
  );
}
