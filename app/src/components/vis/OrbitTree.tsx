import React, { ComponentType, useEffect, useState } from 'react';
import Vis from "./BaseVis";
import { VisType } from './types';
import { hierarchy } from 'd3';
import { VisComponent } from './HOC/withVisCanvas';
import { OrbitHierarchyQueryParams, useGetOrbitHierarchyLazyQuery, useGetOrbitHierarchyQuery } from '../../graphql/generated';
import { useStateTransition } from '../../hooks/useStateTransition';
import { currentSphereHierarchyBounds, setBreadths, setDepths } from '../../state/currentSphereHierarchyAtom';
import { useAtom, useAtomValue } from 'jotai';
import { Modal } from 'flowbite-react';
import { Form, Formik } from 'formik';

export const OrbitTree: ComponentType<VisComponent> = ({
  canvasHeight,
  canvasWidth,
  margin,
  breadthIndex,
  depthIndex,
  render
}) => {
  const [_state, transition, params] = useStateTransition(); // Top level state machine and routing

  const [modalErrorMsg, setModalErrorMsg] = useState<string>("");
  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const queryType = params?.orbitEh ? 'whole' : 'partial';

  const hierarchyBounds = useAtomValue(currentSphereHierarchyBounds);
  const [_, setBreadthBounds] = useAtom(setBreadths);
  const [depthBounds, setDepthBounds] = useAtom(setDepths);

  const getQueryParams = (customDepth?: number) : OrbitHierarchyQueryParams => queryType == 'whole'
  ? { orbitEntryHashB64: params.orbitEh }
  : { levelQuery: { sphereHashB64: params.currentSphereHash, orbitLevel: customDepth || 0 } };

  const [getHierarchy, { data, loading, error }] = useGetOrbitHierarchyLazyQuery()
  const [json, setJson] = useState<string | null>(null);
  const [currentOrbitTree, setCurrentOrbitTree] = useState<Vis | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(!!error || (!params?.orbitEh && !params?.currentSphereHash) || !!(currentOrbitTree && !currentOrbitTree?.rootData));
  const getJsonDerivation = (json: string) => { // Distinguish when it is the starter data (temp) or a whole sphere tree, or an array of trees
    return (queryType == 'whole' || json.search("Live long and prosper") !== -1) ? JSON.parse(json) : JSON.parse(json)[breadthIndex]
  }

  useEffect(() => {
    if(typeof error != 'object') return;
    setIsModalOpen(true)
    const errorObject = Object.values(error)[1]?.[0];
    const parsedGuestError = errorObject.stack.match(/Guest\("([\w\s]+)"\)/);
    setModalErrorMsg(parsedGuestError[1] || "There was an error")

  }, [error])

  useEffect(() => {
    if (!error && typeof data?.getOrbitHierarchy === 'string') {
      let parsedData = JSON.parse(data.getOrbitHierarchy);
      console.log('Fetched data:', parsedData);
      console.log('data.getOrbitHierarchy :>> ', data.getOrbitHierarchy);
      // Continue parsing if the result is still a string
      while (typeof parsedData === 'string') {
        parsedData = JSON.parse(parsedData);
      }
      setBreadthBounds(params?.currentSphereHash, [0, queryType == 'whole' ? 100 : parsedData.result.level_trees.length - 1])
      setJson(JSON.stringify(queryType == 'whole' ? parsedData.result : parsedData.result.level_trees))
    }
  }, [data])

  useEffect(() => {
    if (!error && typeof data?.getOrbitHierarchy === 'string' && currentOrbitTree) {

      currentOrbitTree._nextRootData = hierarchy(getJsonDerivation(json));
      console.log('hierarchyData.depth :>> ', currentOrbitTree._nextRootData);
      setDepthBounds(params?.currentSphereHash, [0, 2]);
      currentOrbitTree._nextRootData._translationCoords = [breadthIndex, depthIndex, hierarchyBounds[params?.currentSphereHash].maxBreadth + 1];
      currentOrbitTree.render();
    }
  }, [json, breadthIndex])

  useEffect(() => {
    if (!error && json && !currentOrbitTree?._hasRendered) {
      const currentTreeJson = getJsonDerivation(json); 
      console.log('Preparing to render with json:', currentTreeJson);
      console.log('currentTreeJson :>> ', currentTreeJson);
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

  useEffect(() => {
    if(error || isModalOpen) return;

    const query = depthBounds ? {...getQueryParams(), orbitLevel: (depthBounds![params?.currentSphereHash] as any).minDepth} : getQueryParams(depthIndex)
    console.log('{ variables: { params: { ...query }} } :>> ', { variables: { params: { ...query }} });
    getHierarchy({ variables: { params: { ...query }} })
  }, [depthIndex])

  console.log('Rendering conditions:', !error, json, currentOrbitTree);
return (<>{!error && json && currentOrbitTree && render(currentOrbitTree, queryType)}
    {isModalOpen && (
        <Modal show={isModalOpen} onClose={toggleModal}>
          <Modal.Header>
            You are unable to visualise right now...
          </Modal.Header>
          <Modal.Body>
            { modalErrorMsg }
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
  </>)
};

export default OrbitTree;
