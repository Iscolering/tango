import styles from './GameControls.module.css';

type GameControlsProps = {
  onUndo: () => void;
  onReset: () => void;
  canUndo: boolean;
};

const GameControls = ({ onUndo, onReset, canUndo }: GameControlsProps) => {
  return (
    <div className={styles.controls}>
      <button 
        className={styles.button} 
        onClick={onUndo} 
        disabled={!canUndo}
      >
        Undo
      </button>
      
      <button className={styles.button} onClick={onReset}>
        Reset
      </button>
    </div>
  );
};

export default GameControls;