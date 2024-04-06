import React from 'react';

export default function Square({
    value,
    onClick
  }: {
    value: string;
    onClick: () => void;
  })  {

  return (
    <div className="h-24 w-24 bg-white text-5xl font-bold flex justify-center items-center border border-black" onClick={onClick}>
      <span style={{ color: value === 'X' ? 'red' : value === 'O' ? 'blue' : 'black' }}>{value}</span>
    </div>
  );
  
}