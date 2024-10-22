// TraversalButtons.tsx
import React from 'react';
import TraversalButton from './TraversalButton';

const TraversalButtons = ({ canGoUp, canGoDown, canGoLeft, canGoRight, actions }) => (
  <>
    <TraversalButton
      condition={canGoUp}
      iconType="up"
      onClick={actions.moveUp}
      dataTestId="vis-go-up"
    />
    <TraversalButton
      condition={canGoDown}
      iconType="down"
      onClick={actions.moveDown}
      dataTestId="vis-go-down"
    />
    <TraversalButton
      condition={canGoLeft}
      iconType="left"
      onClick={actions.moveLeft}
      dataTestId="vis-go-left"
    />
    <TraversalButton
      condition={canGoRight}
      iconType="right"
      onClick={actions.moveRight}
      dataTestId="vis-go-right"
    />
  </>
);

export default TraversalButtons;