import React, { lazy, Suspense } from 'react';
import { TreeVisualization } from "../base-classes/TreeVis";
import { Spinner } from 'habit-fract-design-system';

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
  if (loading) return <span data-testid="loading-tree" />;
  if (error || !json && currentOrbitTree && !currentOrbitTree?.rootData) {
    return <div className="top-10 warning-message fixed flex flex-col items-center justify-center w-full h-full gap-4 pb-48">
    <img className="mb-2" src="assets/icons/warning-icon.svg" alt="warning icon" />
    <h1>There are no Planitts<br /> in this System</h1>
    <h2>Add a Planitt to start tracking your behaviour</h2>
  </div>
  }
  return (
    <>
      {!error && json && currentOrbitTree && (
        <Suspense fallback={<></>}>
          <LazyTreeRenderer
            tree={currentOrbitTree}
            render={render}
          />
        </Suspense>
      )}
    </>
  );
};