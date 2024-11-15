import React, { lazy, Suspense } from 'react';
import { TreeVisualization } from "../base-classes/TreeVis";

const LazyTreeRenderer = lazy(() => import('./TreeRenderer'));

interface TreeVisCoreProps {
  currentOrbitTree: TreeVisualization | null;
  loading: boolean;
  error: any;
  json: string | null;
  render: (tree: TreeVisualization) => React.ReactNode;
}

export const TreeVisCore: React.FC<TreeVisCoreProps> = ({
  currentOrbitTree,
  loading,
  error,
  json,
  render
}) => {
  return (
    <>
      {loading && <span data-testid="vis-spinner" />}
      {!error && json && currentOrbitTree && (
        <Suspense fallback={<span data-testid="tree-spinner" />}>
          <LazyTreeRenderer
            tree={currentOrbitTree}
            render={render}
          />
        </Suspense>
      )}
    </>
  );
};