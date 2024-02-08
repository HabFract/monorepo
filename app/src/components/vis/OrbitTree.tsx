import React, { ComponentType, useEffect, useState } from 'react';
import BaseVisualization from "./BaseVis";
import { VisProps, VisCoverage, VisType } from './types';
import { hierarchy } from 'd3';

import { OrbitHierarchyQueryParams, useGetOrbitHierarchyLazyQuery } from '../../graphql/generated';
import { useStateTransition } from '../../hooks/useStateTransition';
import { currentSphereHierarchyBounds, setBreadths, setDepths } from '../../state/currentSphereHierarchyAtom';
import { useAtom, useAtomValue } from 'jotai';
import { Modal } from 'flowbite-react';
import { Form, Formik } from 'formik';

export const OrbitTree: ComponentType<VisProps> = ({
  canvasHeight,
  canvasWidth,
  margin,
  breadthIndex,
  depthIndex,
  render
}) => {
  // Top level state machine and routing
  const [_state, transition, params] = useStateTransition();
  
  // Does this vis cover the whole tree, or just a window over the whole tree?
  const visCoverage = params?.orbitEh ? VisCoverage.Complete : VisCoverage.Partial;

  // Get and set node traversal bound state
  const hierarchyBounds = useAtomValue(currentSphereHierarchyBounds);
  const [_, setBreadthBounds] = useAtom(setBreadths);
  const [depthBounds, setDepthBounds] = useAtom(setDepths);

  // Helper to form the query parameter object
  const getQueryParams = (customDepth?: number): OrbitHierarchyQueryParams => visCoverage == VisCoverage.Complete
    ? { orbitEntryHashB64: params.orbitEh }
    : { levelQuery: { sphereHashB64: params.currentSphereHash, orbitLevel: customDepth || 0 } };
  // Helper to determine which part of the returned query data should be used in the Vis object
  const getJsonDerivation = (json: string) => visCoverage == VisCoverage.Complete ? JSON.parse(json) : JSON.parse(json)[breadthIndex]

  // Query hook, parsed JSON state, and Vis object state
  const [getHierarchy, { data, loading, error }] = useGetOrbitHierarchyLazyQuery()
  const [json, setJson] = useState<string | null>(null);
  const [currentOrbitTree, setCurrentOrbitTree] = useState<BaseVisualization | null>(null);

  // Modal state, set to open when there is an error or if initial Visualisation is not possible
  const [modalErrorMsg, setModalErrorMsg] = useState<string>("");
  const toggleModal = () => setIsModalOpen(!isModalOpen);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(!!error || (!params?.orbitEh && !params?.currentSphereHash) || !!(currentOrbitTree && !currentOrbitTree?.rootData));

  const fetchHierarchyData = () => {
    if (error || isModalOpen) return;
    const query = depthBounds ? { ...getQueryParams(), orbitLevel: (depthBounds![params?.currentSphereHash] as any).minDepth } : getQueryParams(depthIndex)

    getHierarchy({ variables: { params: { ...query } } })
  }

  const instantiateVisObject = () => {
    if (!error && json && !currentOrbitTree) {
      const currentTreeJson = getJsonDerivation(json);
      const hierarchyData = hierarchy(currentTreeJson);
      const orbitVis = new BaseVisualization(
        VisType.Tree,
        'vis',
        hierarchyData,
        canvasHeight,
        canvasWidth,
        margin
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

  useEffect(fetchHierarchyData, [depthIndex])

  useEffect(() => {
    if (!error && typeof data?.getOrbitHierarchy === 'string') {
      let parsedData = JSON.parse(data.getOrbitHierarchy);
      // Continue parsing if the result is still a string, this undoes more than one level of JSONification
      while (typeof parsedData === 'string') {
        parsedData = JSON.parse(parsedData);
      }
      // Set the limits of node traversal for breadth. If coverage is complete set to an arbitrary number
      setBreadthBounds(params?.currentSphereHash, [0, visCoverage == VisCoverage.Complete ? 100 : parsedData.result.level_trees.length - 1])

      // Depending on query type, set the state of the parsed JSON to the relevant part of the payload
      setJson(JSON.stringify(visCoverage == VisCoverage.Complete ? parsedData.result : parsedData.result.level_trees));
    }
  }, [data])

  useEffect(instantiateVisObject, [json]);

  useEffect(() => {
    if (!error && typeof data?.getOrbitHierarchy === 'string' && currentOrbitTree) {
      // If there is a change to the parsed JSON or we traverse the parsed json's `level_trees` array (breadth traversal), then 
      // -- set the _nextRootData property of the vis, 
      // -- trigger a re-render
      currentOrbitTree._nextRootData = hierarchy(getJsonDerivation(json as string));

      // TODO: set actual depth bounds and perhaps use the translation coords
      setDepthBounds(params?.currentSphereHash, [0, 2]);
      currentOrbitTree._nextRootData._translationCoords = [breadthIndex, depthIndex, hierarchyBounds[params?.currentSphereHash].maxBreadth + 1];

      currentOrbitTree.render();
    }
  }, [json, breadthIndex])

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
      {!error && json && currentOrbitTree && render(currentOrbitTree, visCoverage)}
    </>
  )
};

export default OrbitTree;
