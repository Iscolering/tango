import { CellSymbol } from '../../types/game.types';
import styles from './Cell.module.css';

type CellProps = {
  symbol: CellSymbol;
  isFixed: boolean;
  hasError?: boolean;
  onClick: () => void;
  constraint?: {
    type: 'equal' | 'opposite';
    direction: 'right' | 'bottom';
  };
};

const Cell = ({ symbol, isFixed, hasError, onClick, constraint }: CellProps) => {
  return (
    <div 
      className={`${styles.cell} 
                ${isFixed ? styles.fixed : styles.editable} 
                ${hasError ? styles.error : ''}`}
      onClick={onClick}
    >
      {symbol === CellSymbol.SUN && <div className={styles.sun}>🟡</div>}
      {symbol === CellSymbol.MOON && <div className={styles.moon}>🌙</div>}
      
      {constraint && (
        <div className={`${styles.constraint} ${styles[constraint.direction]}`}>
          {constraint.type === 'equal' ? '=' : '×'}
        </div>
      )}
    </div>
  );
};

export default Cell;