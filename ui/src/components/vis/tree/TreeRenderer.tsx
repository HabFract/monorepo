import React from 'react';
import { TreeVisualization } from "../base-classes/TreeVis";

interface TreeRendererProps {
  tree: TreeVisualization;
  render: (tree: TreeVisualization) => React.ReactNode;
}

const TreeRenderer: React.FC<TreeRendererProps> = ({ tree, render }) => {
  if (!tree || !tree.rootData) {
    return null;
  }

  try {
    return <>{render(tree)}</>;
  } catch (error) {
    console.error('Error rendering tree:', error);
    return null;
  }
};
export default TreeRenderer;