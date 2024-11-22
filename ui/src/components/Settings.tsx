import { Button, ActionCard } from "habit-fract-design-system";
import React, { useState } from "react";
import "./style.css";
import "../typo.css";
import { useSetAtom } from "jotai";
import { nodeCache } from "../state/store";
import { useStateTransition } from "../hooks/useStateTransition";
import {
  Sphere,
  SphereConnection,
  useDeleteSphereMutation,
} from "../graphql/generated";
import { extractEdges, serializeAsyncActions } from "../graphql/utils";
import { sleep } from "./lists/OrbitSubdivisionList";
import { relaunch } from "@tauri-apps/plugin-process";
import { ask } from "@tauri-apps/plugin-dialog";
import { checkForAppUpdates } from "../update";
import { isSmallScreen } from "./vis/helpers";

type SettingsProps = {
  spheres: SphereConnection;
  version: string;
};

const Settings: React.FC<SettingsProps> = ({
  version,
  spheres,
}) => {
  const [_, transition] = useStateTransition(); // Top level state machine and routing
  const clear = useSetAtom(nodeCache.clear);
  const [isDisclaimer, setIsDisclaimer] = useState(false);

  const [
    runDelete,
    { loading: loadingDelete, error: errorDelete, data: dataDelete },
  ] = useDeleteSphereMutation({
    refetchQueries: ["getSpheres"],
  });

  function deleteAllData() {
    serializeAsyncActions<any>([
      ...(extractEdges(spheres) as Sphere[]).map((sphereNode) => async () => {
        try {
          runDelete({ variables: { id: sphereNode.id } });
          await sleep(500);
        } catch (error) {
          console.error(error);
        }
      }),
      async () => Promise.resolve(console.log("Deleted all! :>> ")),
      async () => {
        return relaunch();
      },
    ]);
  }
  
  return (<>
    <section>
      {!isSmallScreen() && (
        <ActionCard 
          title="Check/Download" 
          runAction={() => checkForAppUpdates(true)} 
          body="Check for Updates"
          variant="button"
          button={
            <Button
              variant={"primary responsive"}
              type="button"
            >Check</Button>
          }
        />
      )}
      
      <ActionCard
        title="Clear Cache"
        runAction={() => {
          clear();
          transition("Home");
        }}
        body="Some data is stored in your application runtime (currently not encrypted) to make the experience smoother. Click here to get rid of it all."
        variant="button"
        button={
          <Button
            variant={"primary responsive"}
            type="button"
          >Clear</Button>
        }
      />

      <ActionCard
        title="Bugs/Feedback"
        runAction={() => {
          window.open("https://habitfract.net/feedback/", "_blank");
        }}
        body={`Click this link to open a window to a feedback form (requires an internet connection) so that you can report comments, feedback or bug reports. If you are reporting a bug, please let me know which operating system you are using and any other relevant information. You will need to ${isSmallScreen() ? "" : "right click and "}press back (or restart) to come back to the app. Thanks!`}
        variant="button"
        button={
          <Button
            variant={"primary responsive"}
            type="button"
          >Submit</Button>
        }
      />
    </section>
    
    <section className="danger-zone">
      <ActionCard
        title="Delete All Data"
        runAction={() => {
          ask(`Delete all data and restart?`, {
            title: "Delete All Data",
            kind: "info",
            okLabel: "Delete and Restart",
            cancelLabel: "Cancel",
          }).then((confirm) => {
            if (confirm) deleteAllData();
          });
        }}
        body="Your data is persisted in an encrypted personal ledger. Click 'Reset Data' to reset that ledger and start again."
        variant="button"
        button={
          <Button
            variant={"danger responsive outlined"}
            type="button"
          >Delete</Button>
        }
      />
    </section>
  </>)
};

export default Settings;
