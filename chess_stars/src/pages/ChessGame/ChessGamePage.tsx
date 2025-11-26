import React, { useEffect, useMemo, useState } from 'react'
import {
  MDBBtn,
  MDBCard,
  MDBCardBody,
  MDBIcon,
  MDBContainer,
  MDBRow,
  MDBCol,
} from 'mdb-react-ui-kit'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import './ChessGamePageStyles.css'
import { Square } from 'react-chessboard/dist/chessboard/types'
import {
  changeGame as changeGameAction,
  getFenGame,
} from '../../entities/Game/api/GameApi'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

const ChessGamePage = () => {
  const navigate = useNavigate()
  const [moveHistory, setMoveHistory] = useState<string[]>([])
  const [gameStatus, setGameStatus] = useState<string>('playing')
  const [moveFrom, setMoveFrom] = useState<Square | null>(null)
  const [rightClickedSquares, setRightClickedSquares] = useState<
    Partial<Record<Square, any>>
  >({})
  const [optionSquares, setOptionSquares] = useState<
    Partial<Record<Square, any>>
  >({})

  const { data, isLoading, isError } = useQuery<any, any>({
    queryKey: ['fenGame'],
    queryFn: getFenGame,
  })

  const { mutate: changeGame } = useMutation({
    mutationFn: changeGameAction,
  })

  const game = useMemo(() => new Chess(data?.data?.fen), [data?.data?.fen])
  const [gamePosition, setGamePosition] = useState(game.fen())

  useEffect(() => {
    setGamePosition(game.fen())
    setMoveHistory(game.history())

    // Update game status
    if (game.isCheckmate()) {
      setGameStatus('checkmate')
    } else if (game.isDraw()) {
      setGameStatus('draw')
    } else if (game.isCheck()) {
      setGameStatus('check')
    } else {
      setGameStatus('playing')
    }
  }, [game.fen()])

  const handleChangeGame = () => {
    changeGame({
      id: '0',
      fen: game.fen(),
      history: game.history({ verbose: true }),
    })
  }

  const makeRandomMove = () => {
    const possibleMoves = game.moves()
    if (game.isGameOver() || game.isDraw() || possibleMoves.length === 0) {
      return
    }

    const randomIndex = Math.floor(Math.random() * possibleMoves.length)
    game.move(possibleMoves[randomIndex])
    setGamePosition(game.fen())
    handleChangeGame()
  }

  const getMoveOptions = (square: Square) => {
    const moves = game.moves({
      square,
      verbose: true,
    })
    if (moves.length === 0) {
      setOptionSquares({})
      return false
    }

    const newSquares: Partial<Record<Square, any>> = {}
    moves.map((move) => {
      newSquares[move.to as Square] = {
        background:
          game.get(move.to as Square) &&
          game.get(move.to as Square).color !== game.get(square).color
            ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)'
            : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
        borderRadius: '50%',
      }
      return move
    })

    newSquares[square] = {
      background: 'rgba(255, 255, 0, 0.4)',
    }

    setOptionSquares(newSquares)
    return true
  }

  const onSquareClick = (square: Square) => {
    setRightClickedSquares({})

    // If no piece is selected, try to select this square
    if (!moveFrom) {
      const hasMoveOptions = getMoveOptions(square)
      if (hasMoveOptions) setMoveFrom(square)
      return
    }

    // If same square is clicked, deselect
    if (moveFrom === square) {
      setMoveFrom(null)
      setOptionSquares({})
      return
    }

    // Try to make the move
    const gameCopy = new Chess(game.fen())
    try {
      const move = gameCopy.move({
        from: moveFrom,
        to: square,
        promotion: 'q', // Always promote to queen for simplicity
      })

      if (move) {
        game.move({
          from: moveFrom,
          to: square,
          promotion: 'q',
        })
        setGamePosition(game.fen())
        setMoveFrom(null)
        setOptionSquares({})
        handleChangeGame()

        // Make computer move after a delay
        setTimeout(() => {
          makeRandomMove()
        }, 500)
      } else {
        // Invalid move, try to select the new square
        const hasMoveOptions = getMoveOptions(square)
        setMoveFrom(hasMoveOptions ? square : null)
      }
    } catch (e) {
      // Invalid move, try to select the new square
      const hasMoveOptions = getMoveOptions(square)
      setMoveFrom(hasMoveOptions ? square : null)
    }
  }

  const onPieceDrop = (sourceSquare: Square, targetSquare: Square) => {
    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
      })

      setGamePosition(game.fen())
      setMoveFrom(null)
      setOptionSquares({})
      setRightClickedSquares({})

      if (move === null) return false

      handleChangeGame()

      // Make computer move after a delay
      setTimeout(() => {
        makeRandomMove()
      }, 500)

      return true
    } catch (e) {
      console.error(e)
      return false
    }
  }

  const handleMoveBack = () => {
    if (game.history().length > 0) {
      game.undo()
      game.undo() // Undo computer move too
      setGamePosition(game.fen())
      setMoveFrom(null)
      setOptionSquares({})
      handleChangeGame()
    }
  }

  const handleRestart = () => {
    game.reset()
    setGamePosition(game.fen())
    setMoveFrom(null)
    setOptionSquares({})
    setRightClickedSquares({})
    handleChangeGame()
  }

  const handleBackToMenu = () => {
    navigate('/')
  }

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    navigate('/auth')
  }

  const getStatusMessage = () => {
    switch (gameStatus) {
      case 'checkmate':
        return game.turn() === 'w'
          ? 'Black wins by checkmate!'
          : 'White wins by checkmate!'
      case 'draw':
        return 'Game ended in a draw!'
      case 'check':
        return `${game.turn() === 'w' ? 'White' : 'Black'} is in check!`
      default:
        return `${game.turn() === 'w' ? 'White' : 'Black'} to move`
    }
  }

  if (isLoading) {
    return (
      <div className="chess-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading game...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="chess-page">
        <div className="error-container">
          <MDBIcon fas icon="exclamation-triangle" className="error-icon" />
          <h3>Failed to load game</h3>
          <p>Please try again later.</p>
          <MDBBtn color="primary" onClick={() => navigate('/')}>
            Back to Menu
          </MDBBtn>
        </div>
      </div>
    )
  }

  return (
    <div className="chess-page">
      {/* Header */}
      <header className="chess-header">
        <MDBContainer>
          <div className="header-content">
            <div className="game-title">
              <MDBIcon fas icon="chess-board" className="me-2" />
              Training Game
            </div>
            <div className="header-actions">
              <MDBBtn color="light" size="sm" onClick={handleBackToMenu}>
                <MDBIcon fas icon="home" className="me-2" />
                Menu
              </MDBBtn>
              <MDBBtn color="danger" size="sm" onClick={handleLogout}>
                <MDBIcon fas icon="sign-out-alt" className="me-2" />
                Logout
              </MDBBtn>
            </div>
          </div>
        </MDBContainer>
      </header>

      {/* Main Game Area */}
      <main className="chess-main">
        <MDBContainer>
          <MDBRow className="g-4">
            {/* Game Controls */}
            <MDBCol lg="3" className="order-lg-1 order-2">
              <MDBCard className="controls-card">
                <MDBCardBody>
                  <h5 className="card-title">
                    <MDBIcon fas icon="gamepad" className="me-2" />
                    Game Controls
                  </h5>

                  <div className="control-buttons">
                    <MDBBtn
                      color="primary"
                      size="sm"
                      onClick={handleMoveBack}
                      disabled={game.history().length === 0}
                      className="w-100 mb-2"
                    >
                      <MDBIcon fas icon="undo" className="me-2" />
                      Undo Move
                    </MDBBtn>

                    <MDBBtn
                      color="warning"
                      size="sm"
                      onClick={handleRestart}
                      className="w-100 mb-2"
                    >
                      <MDBIcon fas icon="refresh" className="me-2" />
                      New Game
                    </MDBBtn>

                    <MDBBtn
                      color="success"
                      size="sm"
                      onClick={makeRandomMove}
                      disabled={game.isGameOver()}
                      className="w-100"
                    >
                      <MDBIcon fas icon="robot" className="me-2" />
                      Hint Move
                    </MDBBtn>
                  </div>
                </MDBCardBody>
              </MDBCard>

              {/* Game Status */}
              <MDBCard className="status-card mt-3">
                <MDBCardBody>
                  <h6 className="card-title">
                    <MDBIcon fas icon="info-circle" className="me-2" />
                    Game Status
                  </h6>
                  <div className={`status-message ${gameStatus}`}>
                    {getStatusMessage()}
                  </div>
                  <div className="game-info">
                    <div className="info-item">
                      <span className="info-label">Moves:</span>
                      <span className="info-value">
                        {Math.ceil(game.history().length / 2)}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Turn:</span>
                      <span className="info-value">
                        {game.turn() === 'w' ? 'White' : 'Black'}
                      </span>
                    </div>
                  </div>
                </MDBCardBody>
              </MDBCard>
            </MDBCol>

            {/* Chess Board */}
            <MDBCol lg="6" className="order-lg-2 order-1">
              <MDBCard className="board-card">
                <MDBCardBody className="board-container">
                  <Chessboard
                    id="TrainingBoard"
                    position={gamePosition}
                    onPieceDrop={onPieceDrop}
                    onSquareClick={onSquareClick}
                    customBoardStyle={{
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    }}
                    customSquareStyles={{
                      ...optionSquares,
                      ...rightClickedSquares,
                    }}
                    boardOrientation="white"
                    animationDuration={200}
                  />
                </MDBCardBody>
              </MDBCard>
            </MDBCol>

            {/* Move History */}
            <MDBCol lg="3" className="order-lg-3 order-3">
              <MDBCard className="history-card">
                <MDBCardBody>
                  <h5 className="card-title">
                    <MDBIcon fas icon="history" className="me-2" />
                    Move History
                  </h5>

                  <div className="move-history">
                    {moveHistory.length === 0 ? (
                      <p className="no-moves">No moves yet</p>
                    ) : (
                      <div className="moves-list">
                        {moveHistory.map((move, index) => (
                          <div key={index} className="move-item">
                            <span className="move-number">
                              {Math.ceil((index + 1) / 2)}.
                            </span>
                            <span className="move-notation">{move}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </MDBCardBody>
              </MDBCard>
            </MDBCol>
          </MDBRow>
        </MDBContainer>
      </main>
    </div>
  )
}

export default ChessGamePage
