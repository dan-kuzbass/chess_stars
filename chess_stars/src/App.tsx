import React, { useEffect, useState } from 'react'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import './App.css'
import {BoardOrientation, Piece, Square} from 'react-chessboard/dist/chessboard/types'

const App = () => {
  const [game, setGame] = useState<Chess>(new Chess())
  const [color, setColor] = useState<BoardOrientation>('white')

  const onPieceDrop = (
    sourceSquare: Square,
    targetSquare: Square,
    piece: Piece,
  ) => {
    try {
      const gameCopy: Chess = Object.create(game)
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q', // always promote to a queen for example simplicity
      })
      setGame(gameCopy)

      // Неверный ход
      if (move === null) return false
      setColor((prevState) => prevState === 'black' ? 'white' : 'black')
      return true
    } catch (e) {
      console.error(e)
      return false
    }
  }

  return (
    <div className="App">
      <Chessboard id="BasicBoard" position={game.fen()} boardWidth={500} boardOrientation={color} onPieceDrop={onPieceDrop} />
    </div>
  )
}

export default App
