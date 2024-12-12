import React, { lazy, Suspense } from 'react';
import { TreeVisualization } from "../base-classes/TreeVis";
import { SpinnerFallback } from 'habit-fract-design-system';
import { motion, AnimatePresence } from "framer-motion";
import { ErrorBoundary } from 'react-error-boundary';
import { useEffect } from 'react';
import { useState } from 'react';

const LazyTreeRenderer = lazy(() => import('./TreeRenderer'));

interface TreeVisCoreProps {
  currentOrbitTree: TreeVisualization | null;
  loading: boolean;
  error: any;
  json: string | null;
  render: (tree: TreeVisualization) => React.ReactNode;
}

const ErrorFallback = () => (
  <motion.div
    key="error"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 1 }}
    className="flex flex-col items-center justify-center w-full h-full"
  >
    <h2>Something went wrong rendering the tree.</h2>
    <button onClick={() => window.location.reload()}>Try again</button>
  </motion.div>
);

const WarningMessage = () => (
  <motion.div
    key="warning"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 1 }}
    className="top-10 warning-message fixed flex flex-col items-center justify-center w-full h-full gap-4 pb-48"
  >
    <img className="mb-2" src="assets/icons/warning-icon.svg" alt="warning icon" />
    <h1>There are no Planitts<br /> in this System</h1>
    <h2>Add a Planitt to start tracking your behaviour</h2>
  </motion.div>
);

export const TreeVisCore: React.FC<TreeVisCoreProps> = ({
  currentOrbitTree,
  loading,
  error,
  json,
  render
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="relative w-full h-full">
        <AnimatePresence mode="wait">
          {loading && isMounted ? (
            <motion.div
              key="loading-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.2,
                ease: "easeInOut"
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <SpinnerFallback />
            </motion.div>
          ) : error || (!json && currentOrbitTree && !currentOrbitTree?.rootData) ? (
            <WarningMessage />
          ) : !error && json && currentOrbitTree && isMounted ? (
            <motion.div
              key="tree-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 2,
                ease: "easeInOut"
              }}
              className="absolute inset-0"
            >
              <Suspense
                fallback={
                  <motion.div
                    key="suspense-fallback"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-full h-full flex items-center justify-center"
                  >
                    <SpinnerFallback />
                  </motion.div>
                }
              >
                <LazyTreeRenderer tree={currentOrbitTree} render={render} />
              </Suspense>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
};