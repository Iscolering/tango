// src/components/LevelSelector/LevelSelector.tsx

import React from 'react';
import { puzzles } from '../../utils/puzzleData';
import styles from './LevelSelector.module.css';

type LevelSelectorProps = {
  currentLevel: number;
  onSelectLevel: (levelId: number) => void;
};

const LevelSelector = ({ currentLevel, onSelectLevel }: LevelSelectorProps) => {
  const maxLevel = puzzles.length;
  
  const handlePrevious = () => {
    if (currentLevel > 1) {
      onSelectLevel(currentLevel - 1);
    }
  };
  
  const handleNext = () => {
    if (currentLevel < maxLevel) {
      onSelectLevel(currentLevel + 1);
    }
  };
  
  return (
    <div className={styles.selector}>
      <button 
        className={styles.arrowButton}
        onClick={handlePrevious}
        disabled={currentLevel <= 1}
        aria-label="Previous level"
      >
        ◀
      </button>
      
      <button 
        className={styles.levelButton}
        onClick={() => {/* Optional: could open a level select modal */}}
        aria-label={`Current level is ${currentLevel}`}
      >
        <span className={styles.levelNumber}>{currentLevel}</span>
      </button>
      
      <button 
        className={styles.arrowButton}
        onClick={handleNext}
        disabled={currentLevel >= maxLevel}
        aria-label="Next level"
      >
        ▶
      </button>
    </div>
  );
};

export default LevelSelector;