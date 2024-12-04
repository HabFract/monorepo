import { EntryHashB64 } from "@holochain/client";
import { Modal } from "flowbite-react";

import { currentSphereOrbitNodeDetailsAtom } from "../state/orbit";
import { SphereOrbitNodeDetails, SphereHashes } from "../state/types/sphere";
import { store } from "../state/store";
import { CreateOrbit } from "./forms";
import { IVisualization } from "./vis/types";
import { useStateTransition } from "../hooks/useStateTransition";

export default function VisModal<T extends IVisualization>(
  isModalOpen: boolean,
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>,
  selectedSphere: SphereHashes,
  currentParentOrbitEh: string | undefined,
  currentChildOrbitEh: string | undefined,
  resetModalParentChildStates: () => void,
  setIsAppendingNode: any,
  currentVis: T,
) {
  const [_, transition, params] = useStateTransition(); // Top level state machine and routing

  const editingParent: boolean = !!(currentParentOrbitEh && (currentChildOrbitEh == 'edit'))
  return (
    <Modal
      size="xl"
      show={isModalOpen}
      onClose={() => {
        setIsModalOpen(false);
        resetModalParentChildStates()
      }}
    >
      <Modal.Header>{editingParent ? "Update" : "Add"} Planitt</Modal.Header>
      <Modal.Body>
        <CreateOrbit
          editMode={editingParent}
          inModal={true}
          sphereEh={selectedSphere!.entryHash as EntryHashB64}
          parentOrbitEh={!editingParent ? currentParentOrbitEh : ""}
          orbitToEditId={editingParent ? currentParentOrbitEh : undefined}
          childOrbitEh={currentChildOrbitEh}
          onCreateSuccess={() => {
            setIsModalOpen(false);
            currentVis.isModalOpen = false;
            currentVis.nodeDetails = store.get(
              currentSphereOrbitNodeDetailsAtom,
            ) as SphereOrbitNodeDetails;
            setIsAppendingNode(true)
          }}
        ></CreateOrbit>
      </Modal.Body>
    </Modal>
  );
}
