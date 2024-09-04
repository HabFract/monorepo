import React from 'react';

import './common.css';

interface TickBoxProps {
  id: string;
  completed: boolean;
  toggleIsCompleted: () => void;
  size?: 'main' | 'secondary';
}

const TickBox: React.FC<TickBoxProps> = ({ id, completed, toggleIsCompleted, size }) => {
  const completedClass = completed ? ' checked' : ' unchecked';
  return (
    <img
      id={id}
      className={size == 'main' ? ('relative -top-8 main is-completed' + completedClass) : ('secondary is-completed' + completedClass) }
      onClick={toggleIsCompleted}
      src={completed ? 'assets/checkbox-checked-is.svg' : 'assets/checkbox-empty-is.svg'}
      alt="Check/Uncheck"
    />
  );
};

export default TickBox;