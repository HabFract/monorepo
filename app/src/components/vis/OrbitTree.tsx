import React, { ComponentType, useEffect, useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import Vis from "./BaseVis";
import { VisType } from './types';
import { hierarchy } from 'd3';
import { VisComponent } from './HOC/withVisCanvas';
import { useGetOrbitHierarchyQuery } from '../../graphql/generated';
import { decodeHashFromBase64 } from '@holochain/client';
import { useStateTransition } from '../../hooks/useStateTransition';

export const OrbitTree: ComponentType<VisComponent> = ({
  canvasHeight,
  canvasWidth,
  margin,
  render
}) => {
  const [_state, _transition, params] = useStateTransition(); // Top level state machine and routing
  const { data, loading, error } = useGetOrbitHierarchyQuery({variables: { orbitEntryHashB64: params.orbitEh }});
  console.log('props :>> ', params);
  const [json, setJson] = useState<string>(`{"content":"L1R20-","name":"Live long and prosper","children":[{"content":"L2R13-","name":"Be in peak physical condition","children":[{"content":"L3R12-","name":"Have a good exercise routine","children":[{"content":"L4R5-","name":"go for a short walk at least once a day","children":[]},{"content":"L6R11-","name":"Do some weight training","children":[{"content":"L7R8-","name":"3 sets of weights, til failure","children":[]},{"content":"L9R10-","name":"Do 3 sets of calisthenic exercises","children":[]}]}]}]},{"content":"L14R19-","name":"Establish productive work habits","children":[{"content":"L15R16-","name":"Do one 50 minute pomodoro ","children":[]},{"content":"L17R18-","name":"Read more books on computing","children":[]}]}]}`);
  const [currentOrbitTree, setCurrentOrbitTree] = useState<Vis | null>(null);

  useEffect(() => {
    if (typeof data?.getOrbitHierarchy === 'string') {
          let parsedData = JSON.parse(data.getOrbitHierarchy);
          // Continue parsing if the result is still a string
          while (typeof parsedData === 'string') {
            parsedData = JSON.parse(parsedData);
          }
          console.log('JSON.stringify(parsedData.result) :>> ', JSON.stringify(parsedData.result));
          setJson(JSON.stringify(parsedData.result))
    }
  }, [data])

  useEffect(() => {
    if (json) {
      const hierarchyData = hierarchy(JSON.parse(json));
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
  // useEffect(() => {
  //   if (typeof data?.getOrbitHierarchy === 'string') {
  //     let parsedData = JSON.parse(data.getOrbitHierarchy);
  //     // Continue parsing if the result is still a string
  //     while (typeof parsedData === 'string') {
  //       parsedData = JSON.parse(parsedData);
  //     }
  //     console.log('JSON.stringify(parsedData.result) :>> ', JSON.stringify(parsedData.result));
  //     const hierarchyData = hierarchy(JSON.stringify(parsedData.result));
  //     console.log('hierarchyData :>> ', hierarchyData);
  //     const orbitVis = new Vis(
  //       VisType.Tree,
  //       'vis',
  //       hierarchyData,
  //       canvasHeight,
  //       canvasWidth,
  //       margin
  //     );
  //     setCurrentOrbitTree(orbitVis);
  //   }
  // }, [data]);

  // return currentOrbitTree && render(currentOrbitTree)
};

export default OrbitTree;
