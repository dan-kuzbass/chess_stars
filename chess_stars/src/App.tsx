import React, {useState} from 'react';
import {Chessboard} from 'react-chessboard';
import { Chess } from 'chess.js'

import logo from './logo.svg';
import './App.css';

const App = () => {
    const chess = new Chess()

      return (
        <div className="App">
          <Chessboard id="BasicBoard" boardWidth={400} />
        </div>
      );
}

export default App;
