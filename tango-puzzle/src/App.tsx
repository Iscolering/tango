import { useEffect } from 'react';
import { useGameState } from './hooks/useGameState';
import Board from './components/Board/Board';
import GameControls from './components/GameControls/GameControls';
import HowToPlay from './components/HowToPlay/HowToPlay';
import LevelSelector from './components/LevelSelector/LevelSelector';
import { initSoundEffects, playSound } from './utils/soundEffects';
import './App.css';

function App() {
  const { 
    gameState, 
    completedLevels, 
    toggleCell, 
    undoMove, 
    getHint, 
    resetGame, 
    changeLevel 
  } = useGameState();
  
  // Initialize sound effects on component mount
  useEffect(() => {
    initSoundEffects();
  }, []);
  
  // Play sound when puzzle is completed
  useEffect(() => {
    if (gameState.isSolved) {
      playSound('complete');
    }
  }, [gameState.isSolved]);
  
  return (
    <div className="app">
      <h1>Tango Puzzle</h1>
      
      <HowToPlay />
      
      <LevelSelector 
        currentLevel={gameState.currentLevelId}
        onSelectLevel={changeLevel}
      />
      
      <Board
        board={gameState.board}
        constraints={gameState.constraints}
        onCellClick={toggleCell}
      />
      
      <GameControls
        onUndo={undoMove}
        onReset={resetGame}
        canUndo={gameState.historyIndex > 0}
      />
      
      {gameState.isSolved && (
        <div className="success-message">
          <h2>Level Completed! 🎉</h2>
          <p>Great job! You've solved level {gameState.currentLevelId}.</p>
          {gameState.currentLevelId < 5 && (
            <button 
              className="next-level-button"
              onClick={() => changeLevel(gameState.currentLevelId + 1)}
            >
              Next Level
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default App;