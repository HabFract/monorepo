import React from 'react';
import { TreeVisualization } from "../base-classes/TreeVis";

interface TreeRendererProps {
  tree: TreeVisualization;
  render: (tree: TreeVisualization) => React.ReactNode;
}

const TreeRenderer: React.FC<TreeRendererProps> = ({ tree, render }) => {
  return <>{render(tree)}</>;
};

export default TreeRenderer;