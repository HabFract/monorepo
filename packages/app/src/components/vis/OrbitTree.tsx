import React, { useEffect, useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import Vis from "./BaseVis";
import { updateVisRootData, appendSvg } from "./helpers";
import { VisProps } from './types'; // Ensure this is the correct path to your types

// Define the GraphQL query to fetch the habit hierarchy
const GET_ORBIT_HIERARCHY = gql`
  query GetOrbitHierarchy {
    getOrbitHierarchy
  }
`;

export const OrbitTree: React.FC<VisProps> = ({
  canvasHeight,
  canvasWidth,
  margin,
  divId,
  render,
  routeChanged,
  deleteCompleted,
  changesMade
}) => {
  const { data, loading, error } = useQuery(GET_ORBIT_HIERARCHY);
  const [currentOrbitTree, setCurrentOrbitTree] = useState<Vis | null>(null);

  useEffect(() => {
    appendSvg(divId);
  }, [divId]);

  useEffect(() => {
    if (!loading && data) {
      const hierarchyData = JSON.parse(data.getOrbitHierarchy);
      // Use hierarchyData to instantiate Vis or update currentOrbitTree
      // ...
    }
  }, [data, loading]);

  // Define other effects and logic as needed

  return <>{render(currentOrbitTree)}</>;
};

export default OrbitTree;