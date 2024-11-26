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
  return (
    <>
      {loading && <></>}
      {!error && json && currentOrbitTree && (
        <Suspense fallback={<Spinner />}>
          <LazyTreeRenderer
            tree={currentOrbitTree}
            render={render}
          />
        </Suspense>
      )}
    </>
  );
};