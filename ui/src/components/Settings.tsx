import { Button } from "flowbite-react";
import { HelperText } from "habit-fract-design-system";
import React, { useState } from "react";
import "./style.css";
import "../typo.css";
import { useSetAtom } from "jotai";
import { nodeCache } from "../state/jotaiKeyValueStore";
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
import VersionDisclaimer from "./home/VersionWithDisclaimerButton";
import { ALPHA_RELEASE_DISCLAIMER } from "../constants";
import { isSmallScreen } from "./vis/helpers";

type SettingsProps = {
  spheres: SphereConnection;
  setIsModalOpen: Function;
  setIsSettingsOpen: Function;
  version: string;
};

const Settings: React.FC<SettingsProps> = ({
  version,
  spheres,
  setIsModalOpen,
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
        setIsModalOpen(false);
        return relaunch();
      },
    ]);
  }

  return isDisclaimer ? (
    <p className="disclaimer">{ALPHA_RELEASE_DISCLAIMER}</p>
  ) : (
    <div className="p-4 settings flex flex-col h-full justify-between">
      <section>
        {!isSmallScreen() && (
          <div className="check-updates">
            <HelperText withInfo={false}>Updates</HelperText>
            <Button
              onClick={() => {
                checkForAppUpdates(true);
              }}
              className="btn btn-primary w-64 h-12 my-2"
              size="sm"
            >
              <span>Check/Download</span>
            </Button>
          </div>
        )}
        <div className="cache-settings">
          <HelperText
            withInfo={true}
            onClickInfo={() => ({
              title: "Clear Your Cache",
              body: "Some data is stored in your application runtime (currently not encrypted) to make the experience smoother. Click here to get rid of it all.",
            })}
          >
            Clear Cache
          </HelperText>
          <Button
            onClick={() => {
              clear();
              transition("Home");
            }}
            className="btn btn-warn w-48 h-12 my-2"
            size="sm"
          >
            <span>Clear</span>
          </Button>
        </div>
        <div className="feedback-link">
          <HelperText
            withInfo={true}
            onClickInfo={() => ({
              title: "Open Feedback Form",
              body: `Click this link to open a window to a feedback form (requires an internet connection) so that you can report comments, feedback or bug reports. If you are reporting a bug, please let me know which operating system you are using and any other relevant information. You will need to ${isSmallScreen() ? "" : "right click and "}press back (or restart) to come back to the app. Thanks!`,
            })}
          >
            <span>Bugs/Feedback</span>
          </HelperText>
          <Button
            className="btn btn-secondary w-48 h-12 my-2"
            size="sm"
            onClick={(e) => {
              e.currentTarget.querySelector("a")?.click();
            }}
          >
            <a href="https://habitfract.net/feedback/" className="text-white">
              Link
            </a>
          </Button>
        </div>
      </section>
      <section className="danger-zone">
        <HelperText
          withInfo={true}
          onClickInfo={() => ({
            title: "Delete All Data",
            body: "Your data is persisted in an encrypted personal ledger. Click 'Reset Data' to reset that ledger and start again.",
          })}
        >
          Danger Zone
        </HelperText>
        <Button
          onClick={() => {
            ask(`Delete all data and restart?`, {
              title: "Delete All Data",
              kind: "info",
              okLabel: "Delete and Restart",
              cancelLabel: "Cancel",
            }).then((confirm) => {
              if (confirm) deleteAllData();
            });
          }}
          className="btn btn-danger w-64 h-12 my-2"
          size="sm"
        >
          <span>Reset Data</span>
        </Button>
      </section>
      <VersionDisclaimer
        currentVersion={version}
        open={() => {
          setIsDisclaimer(true);
        }}
      />
    </div>
  );
};

export default Settings;
