import React, { ComponentType, useEffect, useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import Vis from "./BaseVis";
import { VisType } from './types';
import { hierarchy } from 'd3';
import { VisComponent } from './HOC/withVisCanvas';
import { OrbitHierarchyQueryParams, useGetOrbitHierarchyQuery } from '../../graphql/generated';
import { useStateTransition } from '../../hooks/useStateTransition';
import { currentSphereHierarchyBounds, setBreadths, setDepths } from '../../state/currentSphereHierarchy';
import { useAtom } from 'jotai';

export const OrbitTree: ComponentType<VisComponent> = ({
  canvasHeight,
  canvasWidth,
  margin,
  breadthIndex,
  render
}) => {
  const [_state, transition, params] = useStateTransition(); // Top level state machine and routing

  if (!(params?.orbitEh || params?.currentSphereHash)) {
    transition('Home')
  };
  const queryType = params?.orbitEh ? 'whole' : 'partial';

  const queryParams: OrbitHierarchyQueryParams = queryType == 'whole'
    ? { orbitEntryHashB64: params.orbitEh }
    : { levelQuery: { sphereHashB64: params.currentSphereHash, orbitLevel: 1 } };

  const [breadthBounds, setBreadthBounds] = useAtom(setBreadths);

  const { data, loading, error } = useGetOrbitHierarchyQuery({ variables: { params: { ...queryParams } } });

  const [json, setJson] = useState<string>(`{"content":"L1R20-","name":"Live long and prosper","children":[{"content":"L2R13-","name":"Be in peak physical condition","children":[{"content":"L3R12-","name":"Have a good exercise routine","children":[{"content":"L4R5-","name":"go for a short walk at least once a day","children":[]},{"content":"L6R11-","name":"Do some weight training","children":[{"content":"L7R8-","name":"3 sets of weights, til failure","children":[]},{"content":"L9R10-","name":"Do 3 sets of calisthenic exercises","children":[]}]}]}]},{"content":"L14R19-","name":"Establish productive work habits","children":[{"content":"L15R16-","name":"Do one 50 minute pomodoro ","children":[]},{"content":"L17R18-","name":"Read more books on computing","children":[]}]}]}`);
  const [currentOrbitTree, setCurrentOrbitTree] = useState<Vis | null>(null);

  useEffect(() => {
    if (typeof data?.getOrbitHierarchy === 'string') {
      let parsedData = JSON.parse(data.getOrbitHierarchy);
      // Continue parsing if the result is still a string
      while (typeof parsedData === 'string') {
        parsedData = JSON.parse(parsedData);
      }
      setBreadthBounds(params?.currentSphereHash, [0, queryType == 'whole' ? 100 : parsedData.result.level_trees.length - 1])
      setJson(JSON.stringify(queryType == 'whole' ? parsedData.result : parsedData.result.level_trees))
    }
  }, [data])

  useEffect(() => {
    if (typeof data?.getOrbitHierarchy === 'string' && currentOrbitTree) {
      currentOrbitTree._nextRootData = hierarchy(JSON.parse(json)[breadthIndex]);
      currentOrbitTree.render();
    }
  }, [json, breadthIndex])

  useEffect(() => {
    if (json && !currentOrbitTree?._hasRendered) {
      const currentTreeJson = (queryType == 'whole' || json.search("Live long and prosper") !== -1) ? JSON.parse(json) : JSON.parse(json)[0]; 
      const hierarchyData = hierarchy(currentTreeJson);
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
  }, [json]);

  return json && render(currentOrbitTree)
};

export default OrbitTree;
