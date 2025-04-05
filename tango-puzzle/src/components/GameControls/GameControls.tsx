import styles from './GameControls.module.css';

type GameControlsProps = {
  onUndo: () => void;
  onHint: () => void;
  onReset: () => void;
  canUndo: boolean;
};

const GameControls = ({ onUndo, onHint, onReset, canUndo }: GameControlsProps) => {
  return (
    <div className={styles.controls}>
      <button 
        className={styles.button} 
        onClick={onUndo} 
        disabled={!canUndo}
      >
        Undo
      </button>
      <button className={styles.button} onClick={onHint}>
        Stuck? (Hint)
      </button>
      <button className={styles.button} onClick={onReset}>
        Reset
      </button>
    </div>
  );
};

export default GameControls;