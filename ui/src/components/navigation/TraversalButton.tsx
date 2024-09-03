import React from 'react';
import { EnterOutlined, LeftOutlined, RightOutlined, DownOutlined, UpCircleTwoTone, DownCircleTwoTone, RightCircleTwoTone, LeftCircleTwoTone } from '@ant-design/icons';

import "./common.css";

interface TraversalButtonProps {
  condition: boolean;
  iconType: 'up' | 'left' | 'down-left' | 'right' | 'down' | 'down-right';
  onClick: () => void;
  dataTestId: string;
}

const TraversalButton: React.FC<TraversalButtonProps> = ({ condition, iconType, onClick, dataTestId, style }) => {
  if (!condition) return <span className="spacer absolute"></span>;

  const IconComponent = (() => {
    switch (iconType) {
      case 'up':
        return <UpCircleTwoTone twoToneColor={'#4E5454'} data-testid={dataTestId} className='traversal-button up' onClick={onClick} />;
      case 'left':
        return <LeftCircleTwoTone twoToneColor={'#4E5454'} data-testid={dataTestId} className='traversal-button left' onClick={onClick} />;
      case 'down-left':
        return <DownCircleTwoTone style={{transform: 'rotate(45deg)'}} twoToneColor={'#4E5454'} data-testid={dataTestId} className='traversal-button d-left' onClick={onClick} />;
      case 'right':
        return <RightCircleTwoTone twoToneColor={'#4E5454'} data-testid={dataTestId} className='traversal-button right' onClick={onClick} />;
      case 'down':
        return <DownCircleTwoTone twoToneColor={'#4E5454'} data-testid={dataTestId} className='traversal-button down' onClick={onClick} />;
      case 'down-right':
        return <DownCircleTwoTone style={{transform: 'rotate(-45deg)'}} twoToneColor={'#4E5454'} data-testid={dataTestId} className='traversal-button d-right' onClick={onClick} />;
      default:
        return null;
    }
  })();

  return IconComponent;
};

export default TraversalButton;