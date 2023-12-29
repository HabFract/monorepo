import React, { ComponentType, useEffect, useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import Vis from "./BaseVis";
import { VisType } from './types';
import { hierarchy } from 'd3';
import { VisComponent } from './HOC/withVisCanvas';
import { useGetOrbitHierarchyQuery } from '../../graphql/generated';
import { decodeHashFromBase64 } from '@holochain/client';

export const OrbitTree: ComponentType<VisComponent> = ({
  canvasHeight,
  canvasWidth,
  margin,
  render,
}) => {
  const { data, loading, error } = useGetOrbitHierarchyQuery({variables: { orbitEntryHashB64: ("uhCkkiMqhpYpAxnNwWFGsR-IWIAGwNtMprYqCCKDaYlUGYbmpehm5") as any}});
  const [currentOrbitTree, setCurrentOrbitTree] = useState<Vis | null>(null);
  console.log('data :>> ', data);
  // Mock data until the vis is stable:
  // const data = `{"content":"L1R20-","name":"Live long and prosper","children":[{"content":"L2R13-","name":"Be in peak physical condition","children":[{"content":"L3R12-","name":"Have a good exercise routine","children":[{"content":"L4R5-","name":"go for a short walk at least once a day","children":[]},{"content":"L6R11-","name":"Do some weight training","children":[{"content":"L7R8-","name":"3 sets of weights, til failure","children":[]},{"content":"L9R10-","name":"Do 3 sets of calisthenic exercises","children":[]}]}]}]},{"content":"L14R19-","name":"Establish productive work habits","children":[{"content":"L15R16-","name":"Do one 50 minute pomodoro ","children":[]},{"content":"L17R18-","name":"Read more books on computing","children":[]}]}]}`
  // const loading = false;

  useEffect(() => {
    if (!loading && data) {
      const hierarchyData = hierarchy(JSON.parse(data as any));
      const orbitVis = new Vis(
        VisType.Tree,
        'vis',
        hierarchyData,
        canvasHeight,
        canvasWidth,
        margin
      );
      setCurrentOrbitTree(orbitVis)
    }
  }, [data]);

  return data && render(currentOrbitTree)
};

export default OrbitTree;