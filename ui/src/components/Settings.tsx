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
