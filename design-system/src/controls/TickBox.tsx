import React from 'react';

interface TickBoxProps {
  completed: boolean;
  toggleIsCompleted: () => void;
  size?: 'main' | 'secondary';
}

const TickBox: React.FC<TickBoxProps> = ({ completed, toggleIsCompleted, size }) => {
  return (
    <img
      className={size == 'main' ? 'main is-completed' : 'secondary is-completed' }
      onClick={toggleIsCompleted}
      src={completed ? 'assets/checkbox-checked-is.svg' : 'assets/checkbox-empty-is.svg'}
      alt="Check/Uncheck"
    />
  );
};

export default TickBox;