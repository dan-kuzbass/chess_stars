import React, { useState } from 'react'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import './ChessGamePageStyles.css'
import { Square } from 'react-chessboard/dist/chessboard/types'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../store'
import { changeFen } from '../../store/slices/game'

const ChessGamePage = () => {
  const fen = useSelector((state: RootState) => state.game.fen)
  const dispatch = useDispatch()

  const onPieceDrop = (sourceSquare: Square, targetSquare: Square) => {
    try {
      const gameCopy: Chess = Object.create(fen)
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q', // always promote to a queen for example simplicity
      })
      dispatch(changeFen(gameCopy))

      // Неверный ход
      return move !== null
    } catch (e) {
      console.error(e)
      return false
    }
  }

  return (
    <div className="Container">
      <div className="ChessBoardContainer">
        <Chessboard
          id="BasicBoard"
          position={fen.fen()}
          onPieceDrop={onPieceDrop}
        />
      </div>
    </div>
  )
}

export default ChessGamePage
