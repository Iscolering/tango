import { useState } from 'react';
import styles from './HowToPlay.module.css';

const HowToPlay = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className={styles.howToPlay}>
      <button 
        className={styles.toggleButton}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? 'Hide Rules' : 'How to Play'}
      </button>
      
      {isOpen && (
        <div className={styles.rules}>
          <h3>Tango Puzzle Rules:</h3>
          <ul>
            <li>Fill each cell with either a sun (🟡) or a moon (🌙).</li>
            <li>No more than two of the same symbol can be adjacent horizontally or vertically.</li>
            <li>Each row and column must have exactly 3 suns and 3 moons.</li>
            <li>Cells separated by an "=" sign must contain the same symbol.</li>
            <li>Cells separated by a "×" sign must contain opposite symbols.</li>
            <li>Gray cells are prefilled and cannot be changed.</li>
          </ul>
          <p>Click on an empty cell to place a sun, click again to change it to a moon.</p>
        </div>
      )}
    </div>
  );
};

export default HowToPlay;