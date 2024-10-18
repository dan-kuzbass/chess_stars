import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { Chess } from 'chess.js'

export interface GameState {
  fen: Chess
}

const initialState: GameState = {
  fen: new Chess(),
}

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    changeFen: (state, action: PayloadAction<Chess>) => {
      state.fen = action.payload
    },
    resetGameStore: (state) => {
      state.fen = new Chess()
    },
  },
})

// Action creators are generated for each case reducer function
export const { changeFen, resetGameStore } = gameSlice.actions

export default gameSlice.reducer
