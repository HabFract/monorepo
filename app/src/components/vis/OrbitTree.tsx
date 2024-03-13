import React, { ComponentType, useEffect, useState } from 'react';
import BaseVisualization from "./BaseVis";
import { VisProps, VisCoverage, VisType } from './types';
import { hierarchy } from "d3-hierarchy";
import { OrbitHierarchyQueryParams, useGetOrbitHierarchyLazyQuery } from '../../graphql/generated';

import { useAtom, useAtomValue } from 'jotai';
import { useStateTransition } from '../../hooks/useStateTransition';
import { SphereOrbitNodes, nodeCache, store } from '../../state/jotaiKeyValueStore';
import { currentOrbitCoords, currentSphere, currentSphereHierarchyBounds, setBreadths, setDepths } from '../../state/currentSphereHierarchyAtom';

import { Modal } from 'flowbite-react';
import { Form, Formik } from 'formik';
import { ActionHashB64, EntryHashB64 } from '@holochain/client';
import { useFetchOrbitsAndCacheHierarchyPaths } from '../../hooks/useFetchOrbitsAndCacheHierarchyPaths';

export const OrbitTree: ComponentType<VisProps> = ({
  canvasHeight,
  canvasWidth,
  margin,
  render
}) => {
  // Top level state machine and routing
  const [_state, transition, params] = useStateTransition();

  // Get sphere and sphere orbit nodes details
  const nodeDetailsCache =  Object.fromEntries(useAtomValue(nodeCache.entries));
  const sphereNodeDetails = nodeDetailsCache[params.currentSphereAhB64] || {}
  
  // Does this vis cover the whole tree, or just a window over the whole tree?
  const visCoverage = params?.orbitEh ? VisCoverage.Complete : VisCoverage.Partial;

  // Get and set node traversal bound state
  const sphere = useAtomValue(currentSphere);
  const hierarchyBounds = useAtomValue(currentSphereHierarchyBounds);
  const [_, setBreadthBounds] = useAtom(setBreadths);
  const [depthBounds, setDepthBounds] = useAtom(setDepths);
  const result = useAtomValue(currentOrbitCoords)
  const {x,y} = useAtomValue(currentOrbitCoords)
  
  // Helper to form the query parameter object
  const getQueryParams = (customDepth?: number): OrbitHierarchyQueryParams => visCoverage == VisCoverage.Complete
    ? { orbitEntryHashB64: params.orbitEh }
    : { levelQuery: { sphereHashB64: params.currentSphereEhB64, orbitLevel: customDepth || 0 } };
  // Helper to determine which part of the returned query data should be used in the Vis object
  const getJsonDerivation = (json: string) => visCoverage == VisCoverage.Complete ? JSON.parse(json) : JSON.parse(json)[x]

  // GQL Query hook, parsed JSON state, and Vis object state
  const [getHierarchy, { data, loading, error }] = useGetOrbitHierarchyLazyQuery({
    fetchPolicy: "network-only"
  })
  const [json, setJson] = useState<string | null>(null);
  const [currentOrbitTree, setCurrentOrbitTree] = useState<BaseVisualization | null>(null);

  // Modal state, set to open when there is an error or if initial Visualisation is not possible
  const [modalErrorMsg, setModalErrorMsg] = useState<string>("");
  const toggleModal = () => setIsModalOpen(!isModalOpen);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(!!error || (!params?.orbitEh && !params?.currentSphereEhB64) || !!(currentOrbitTree && !currentOrbitTree?.rootData));
  
  // Traverse (but don't render) the root of the sphere's hierarchy so that we can cache the correct path to append at the top of the vis
  const [hasCached, setHasCached] = useState<boolean>(false);
  const { loading: loadCache, error: errorCache, cache } = useFetchOrbitsAndCacheHierarchyPaths({params: getQueryParams(), hasCached})

  const fetchHierarchyData = () => {
    if (error || isModalOpen) return;
    const query = depthBounds ? { ...getQueryParams(), orbitLevel: (depthBounds![params?.currentSphereEhB64] as any).minDepth } : getQueryParams(y)
    getHierarchy({ variables: { params: { ...query } } })
  }

  const instantiateVisObject = () => {
    if (!error && json && !currentOrbitTree) {
      const currentTreeJson = getJsonDerivation(json);
      const hierarchyData = hierarchy(currentTreeJson).sort((a, b) => {
        const idA : ActionHashB64 = a.data.content;
        const idB : ActionHashB64 = b.data.content;
        const sphereNodes = nodeDetailsCache[params.currentSphereAhB64 as ActionHashB64] as SphereOrbitNodes;
        return (sphereNodes[idA].startTime as number) - (sphereNodes[idB as keyof SphereOrbitNodes].startTime as number)
      });
        
      
      setDepthBounds(params?.currentSphereEhB64, [0, visCoverage == VisCoverage.Complete ? 100 : hierarchyData.height])

      const orbitVis = new BaseVisualization(
        VisType.Tree,
        'vis',
        hierarchyData,
        canvasHeight,
        canvasWidth,
        margin,
        transition,
        params.currentSphereEhB64 as EntryHashB64,
        params.currentSphereAhB64 as ActionHashB64,
        sphereNodeDetails as SphereOrbitNodes,
      );
      setCurrentOrbitTree(orbitVis)
    }
  }

  useEffect(() => {
    if (typeof error != 'object') return;
    setIsModalOpen(true)
    const errorObject = Object.values(error)[1]?.[0];
    const parsedGuestError = errorObject.stack.match(/Guest\("([\w\s]+)"\)/);
    setModalErrorMsg(parsedGuestError[1] || "There was an error")
  }, [error])

  useEffect(() => {
    if(!hasCached && cache !== null) { // Check that the hook has finished fetching data and returned a cache function
      try {
        cache()
        setHasCached(true);
      } catch (error) {
        console.error(error)   
      }
    }
  }, [cache, data])

  useEffect(fetchHierarchyData, [y])

  useEffect(() => {
    const cacheEntries = nodeDetailsCache[params?.currentSphereAhB64] as SphereOrbitNodes;
    const byStartTime = (a, b) => {
      if(!cacheEntries) return 0;
      return (cacheEntries[a.content]?.startTime || 0) - (cacheEntries[b.content]?.startTime || 0)
    }
    if (!error && typeof data?.getOrbitHierarchy === 'string') {
      let parsedData = JSON.parse(data.getOrbitHierarchy);
      // Continue parsing if the result is still a string, this undoes more than one level of JSONification
      while (typeof parsedData === 'string') {
        parsedData = JSON.parse(parsedData);
      }
      
      // Set the limits of node traversal for breadth. If coverage is complete set to an arbitrary number
      setBreadthBounds(params?.currentSphereEhB64, [0, visCoverage == VisCoverage.Complete ? 100 : parsedData.result.level_trees.length - 1])
      // Trigger path cacheing if we have appended a node
      const newHierarchyDescendants = hierarchy(parsedData.result.level_trees?.sort(byStartTime)[x])?.descendants()?.length;
      const oldHierarchyDescendants = currentOrbitTree?.rootData.descendants().length;
      setHasCached(newHierarchyDescendants == oldHierarchyDescendants);

      // Depending on query type, set the state of the parsed JSON to the relevant part of the payload
      setJson(JSON.stringify(visCoverage == VisCoverage.Complete ? parsedData.result : parsedData.result.level_trees.sort(byStartTime)));
    }
  }, [data])

  useEffect(instantiateVisObject, [json]);

  useEffect(() => {
    if (!error && typeof data?.getOrbitHierarchy === 'string' && currentOrbitTree) {
      // If there is a change to the parsed JSON or we traverse the parsed json's `level_trees` array (breadth traversal), then 
      // -- set the _nextRootData property of the vis, 
      // -- trigger a re-render
      currentOrbitTree._nextRootData = hierarchy(getJsonDerivation(json as string)).sort((a, b) => {
        const idA : ActionHashB64 = a.data.content;
        const idB : ActionHashB64 = b.data.content;
        const sphereNodes = nodeDetailsCache[params.currentSphereAhB64 as ActionHashB64] as SphereOrbitNodes;
        return (sphereNodes[idA].startTime as number) - (sphereNodes[idB as keyof SphereOrbitNodes].startTime as number)
      });
      
      currentOrbitTree._nextRootData._translationCoords = [x, y, hierarchyBounds[params?.currentSphereEhB64].maxBreadth + 1];
      currentOrbitTree.render();
    }
  }, [json, x, y])

  return (
    <>
      {loading && <div>Loading!</div>}
      {isModalOpen && (
        <Modal show={isModalOpen} onClose={toggleModal}>
          <Modal.Header>
            You are unable to visualise right now...
          </Modal.Header>
          <Modal.Body>
            {modalErrorMsg}
            <Formik
              initialValues={{

              }}
              onSubmit={(_values) => {
                toggleModal();
              }}
            >
              {({ handleSubmit }) => (
                <Form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <div className="flex flex-col">
                        <label className='text-xl lowercase capitalize'>
                        </label>
                        <label className='text-xl lowercase capitalize'>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button type="submit" className="btn btn-primary">
                      Ok
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </Modal.Body>
        </Modal>
      )}
      {!error && json && currentOrbitTree && render(currentOrbitTree, visCoverage, x, y, hierarchy(getJsonDerivation(json)))}
    </>
  )
};

export default OrbitTree;
