"use client";

import { useState } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUndo,
  faRedo,
  faTrash,
  faChess,
} from "@fortawesome/free-solid-svg-icons";

export default function ChessGamePage() {
  const [game, setGame] = useState(new Chess());
  const [moveHistory, setMoveHistory] = useState<string[]>([]);

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });

      if (move === null) return false;

      setMoveHistory([...moveHistory, move.san]);
      return true;
    } catch (error) {
      return false;
    }
  };

  const resetBoard = () => {
    const newGame = new Chess();
    setGame(newGame);
    setMoveHistory([]);
  };

  const undoMove = () => {
    const history = game.history();

    // Get SAN notation for move history (all moves except the last one)
    const sanHistory = history.slice(0, -1);

    // Recreate the game state
    const newGame = new Chess();
    sanHistory.forEach((move) => {
      newGame.move(move);
    });

    setGame(newGame);
    setMoveHistory(sanHistory);
  };

  const redoMove = () => {
    // In a real implementation, we would need to store the redo history
    // For now, this is just a placeholder
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <FontAwesomeIcon
                icon={faChess}
                className="text-indigo-600 text-xl mr-3"
              />
              <h1 className="text-xl font-semibold text-gray-900">
                Chess Practice Board
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <p className="text-gray-600 max-w-2xl mx-auto">
            Practice your chess moves and strategies. Drag pieces to make moves,
            and use the controls below to manage your game.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <span className="text-lg font-medium text-gray-900">
                  Chess Board
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={undoMove}
                    disabled={moveHistory.length === 0}
                    className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${
                      moveHistory.length === 0
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <FontAwesomeIcon icon={faUndo} className="mr-1" />
                    Undo
                  </button>
                  <button
                    onClick={redoMove}
                    disabled
                    className="flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-400 cursor-not-allowed"
                  >
                    <FontAwesomeIcon icon={faRedo} className="mr-1" />
                    Redo
                  </button>
                  <button
                    onClick={resetBoard}
                    className="flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100"
                  >
                    <FontAwesomeIcon icon={faTrash} className="mr-1" />
                    Reset
                  </button>
                </div>
              </div>
              <div className="p-6 flex justify-center">
                <div className="chess-board-container">
                  <Chessboard
                    position={game.fen()}
                    onPieceDrop={onDrop}
                    boardWidth={Math.min(
                      500,
                      typeof window !== "undefined"
                        ? window.innerWidth * 0.8
                        : 500
                    )}
                    arePiecesDraggable={true}
                    customBoardStyle={{
                      borderRadius: "8px",
                      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                    }}
                    customDarkSquareStyle={{ backgroundColor: "#4b5563" }}
                    customLightSquareStyle={{ backgroundColor: "#9ca3af" }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 mb-6">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-medium text-gray-900">
                  Move History
                </h2>
              </div>
              <div className="p-6">
                {moveHistory.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No moves yet</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {moveHistory.map((move, index) => (
                      <div
                        key={index}
                        className="flex items-center py-2 px-3 rounded-lg hover:bg-gray-50"
                      >
                        <span className="text-gray-500 w-8 text-right mr-3">
                          {Math.floor(index / 2) + 1}
                          {index % 2 === 0 ? "." : "..."}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-sm font-medium ${
                            index % 2 === 0
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {move}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-medium text-gray-900">
                  Game Status
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Turn:</span>
                  <span
                    className={`px-2 py-1 rounded text-sm font-medium ${
                      game.turn() === "w"
                        ? "bg-white border border-gray-300 text-gray-700"
                        : "bg-gray-800 text-white"
                    }`}
                  >
                    {game.turn() === "w" ? "White" : "Black"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className="text-gray-900">
                    {game.isCheckmate()
                      ? "Checkmate"
                      : game.isCheck()
                      ? "Check"
                      : game.isDraw()
                      ? "Draw"
                      : "Playing"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Moves:</span>
                  <span className="text-gray-900">{moveHistory.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
