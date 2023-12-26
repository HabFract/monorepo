import React, { useEffect, useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import Vis from "./BaseVis";
import { updateVisRootData, appendSvg } from "./helpers";
import { VisProps, VisType } from './types'; // Ensure this is the correct path to your types
import { hierarchy } from 'd3';

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
  render,
}) => {
  // const { data, loading, error } = useQuery(GET_ORBIT_HIERARCHY);
  const [currentOrbitTree, setCurrentOrbitTree] = useState<Vis | null>(null);

  // Mock data until the vis is stable:
  const data = `{"content":"L1R20-","name":"Live long and prosper","children":[{"content":"L2R13-","name":"Be in peak physical condition","children":[{"content":"L3R12-","name":"Have a good exercise routine","children":[{"content":"L4R5-","name":"go for a short walk at least once a day","children":[]},{"content":"L6R11-","name":"Do some weight training","children":[{"content":"L7R8-","name":"3 sets of weights, til failure","children":[]},{"content":"L9R10-","name":"Do 3 sets of calisthenic exercises","children":[]}]}]}]},{"content":"L14R19-","name":"Establish productive work habits","children":[{"content":"L15R16-","name":"Do one 50 minute pomodoro ","children":[]},{"content":"L17R18-","name":"Read more books on computing","children":[]}]}]}`
  const loading = false;

  // useEffect(() => {
  //   if (!currentHabitTree?._svgId || currentHierarchy?.data.name == "") return
    

  // }, [routeChanged,currentHierarchy?.data.name])

  useEffect(() => {
    if (!loading && data) {
      const hierarchyData = hierarchy(JSON.parse(data));
      const orbitVis = new Vis(
        VisType.Tree,
        'vis',
        hierarchyData,
        canvasHeight,
        canvasWidth,
        margin
      );
      setCurrentOrbitTree(orbitVis)

      //   orbitVis.render();
      // updateVisRootData(currentOrbitTree, hierarchyData);
    }
  }, [data]);

  return data && render(currentOrbitTree)
};

export default OrbitTree;