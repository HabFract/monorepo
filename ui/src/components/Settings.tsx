import { Button, ActionCard } from "habit-fract-design-system";
import React, { useState } from "react";
import "./style.css";
import "../typo.css";
import { useSetAtom } from "jotai";
import { nodeCache } from "../state/store";
import { useStateTransition } from "../hooks/useStateTransition";
import {
  Sphere,
  useDeleteSphereMutation,
  useGetSpheresQuery,
} from "../graphql/generated";
import { extractEdges } from "../graphql/utils";
import { sleep } from "./lists/OrbitSubdivisionList";
import { relaunch } from "@tauri-apps/plugin-process";
import { ask } from "@tauri-apps/plugin-dialog";
import { checkForAppUpdates } from "../update";
import { isSmallScreen } from "./vis/helpers";
import { DataLoadingQueue } from "./PreloadAllData";

const Settings: React.FC<{}> = ({}) => {
  const [_, transition] = useStateTransition();
  const clear = useSetAtom(nodeCache.clear);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    loading: loadingSpheres,
    error,
    data: spheresData,
  } = useGetSpheresQuery();
  const sphereNodes = spheresData?.spheres?.edges && extractEdges(spheresData.spheres) as Sphere[];

  const [
    runDelete,
    { loading: loadingDelete, error: errorDelete, data: dataDelete },
  ] = useDeleteSphereMutation({
    refetchQueries: ["getSpheres"]
  });

  const deleteAllData = async () => {
    try {
      if(!sphereNodes || sphereNodes.length == 0) return;
      const deletionQueue = new DataLoadingQueue();
      setIsDeleting(true);
      clear()

      // Queue up deletion of each sphere
      for (const sphere of sphereNodes) {
        await deletionQueue.enqueue(async () => {
          console.log(`Deleting sphere: ${sphere.name}`);
          const result = await runDelete({ 
            variables: { id: sphere.id }
          });
          
          console.log('Delete mutation result:', {
            sphere: sphere.name,
            result,
            error: errorDelete
          });
          
          await sleep(500);
        });
      }

      // Final cleanup task
      await deletionQueue.enqueue(async () => {
        console.log('All spheres deleted, cleaning up...');
        clear();
        await sleep(500);
        // Uncomment when ready to re-enable relaunch
        // await relaunch();
      });

    } catch (error) {
      console.error('Error during deletion:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Update the delete button to show loading state
  const handleDeleteClick = async () => {
    const confirmed = await ask(`Reset data?`, {
      title: "Confirm Resetting Data",
      kind: "info",
      okLabel: "Reset",
      cancelLabel: "Cancel",
    });
    
    if (confirmed) {
      await deleteAllData();
    }
  };
  return (<>
    <section>
      {!isSmallScreen() && (
        <ActionCard
          title="Check/Download"
          body="Check for Updates"
          variant="button"
          button={
            <Button
              onClick={() => checkForAppUpdates(true)}
              variant={"primary responsive"}
              type="button"
            >Check</Button>
          }
        />
      )}

      <ActionCard
        title="Clear Cache"
        body="Clear cache to reset tracked data, improve app speed, and free storage."
        variant="button"
        button={
          <Button
            onClick={() => {
              clear();
              transition("PreloadAndCache");
            }}
            variant={"primary responsive"}
            type="button"
          >Clear</Button>
        }
      />

      <ActionCard
        title="Bugs/Feedback"
        body={`Report bugs or send feedback to help enhance your app experience and performance.`}
        variant="button"
        button={
          <Button
            variant={"primary responsive"}
            type="button"
            onClick={((e) => {
              e.currentTarget.querySelector("a")?.click();
            }) as any}
          ><a href="https://habitfract.net/feedback/" className="text-white">Open Feedback Form
          </a>
          </Button>
        }
      />
    </section>

    <section className="danger-zone">
      <ActionCard
        title="Delete All Data"
        body="Reset your all data, removing all tracked progress and settings."
        variant="button"
        button={
          <Button
            onClick={() => {
              ask(`Reset data?`, {
                title: "Confirm Resetting Data",
                kind: "info",
                okLabel: "Reset",
                cancelLabel: "Cancel",
              }).then((confirm) => {
                if (confirm) deleteAllData();
                transition("Home")
              });
            }}
            variant={"danger responsive outlined"}
            type="button"
          >Delete</Button>
        }
      />
    </section>
  </>)
};

export default Settings;
