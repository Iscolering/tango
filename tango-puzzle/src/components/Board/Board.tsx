import { useMemo } from 'react';
import Cell from '../Cell/Cell';
import { CellData, Constraint, ConstraintType } from '../../types/game.types';
import styles from './Board.module.css';

type BoardProps = {
  board: CellData[][];
  constraints: Constraint[];
  onCellClick: (row: number, col: number) => void;
};

const Board = ({ board, constraints, onCellClick }: BoardProps) => {
  // Process constraints to make them easier to use in the Cell component
  const cellConstraints = useMemo(() => {
    const result: Record<string, { type: 'equal' | 'opposite', direction: 'right' | 'bottom' }> = {};
    
    constraints.forEach(constraint => {
      // We'll only show constraints from the left cell to the right cell
      // or from the top cell to the bottom cell for clarity
      const { row1, col1, row2, col2, type } = constraint;
      
      // Horizontal constraint
      if (row1 === row2 && col2 === col1 + 1) {
        result[`${row1},${col1}`] = {
          type: type === ConstraintType.EQUAL ? 'equal' : 'opposite',
          direction: 'right'
        };
      }
      // Vertical constraint
      else if (col1 === col2 && row2 === row1 + 1) {
        result[`${row1},${col1}`] = {
          type: type === ConstraintType.EQUAL ? 'equal' : 'opposite',
          direction: 'bottom'
        };
      }
    });
    
    return result;
  }, [constraints]);
  
  return (
    <div className={styles.board}>
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className={styles.row}>
          {row.map((cell, colIndex) => (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              symbol={cell.symbol}
              isFixed={cell.isFixed}
              hasError={cell.hasError}
              onClick={() => onCellClick(rowIndex, colIndex)}
              constraint={cellConstraints[`${rowIndex},${colIndex}`]}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Board;