import {
  AppEntryDef,
  AppInfo,
  AppAgentWebsocket,
  InstallAppRequest,
  encodeHashToBase64,
  CellInfo,
  ProvisionedCell,
  CellType,
} from "@holochain/client";
import {
  Conductor,
  addAllAgentsToAllConductors,
  createConductor,
  runLocalServices,
  stopLocalServices,
  cleanAllConductors,
} from "@holochain/tryorama";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const habits_dna = path.join(
  __dirname,
  "../crates/dnas/habits/workdir/habits.dna"
);

export const installAgent = async (
  conductor: Conductor,
  agentName: string,
) => {
  let agentsHapps: Array<any> = [];
  let appAgentWs: AppAgentWebsocket;
  let agent_key;
  let habits_cell;
  try {
    const admin = conductor.adminWs();

    console.log(`generating key for: ${agentName}:`);
    agent_key = await admin.generateAgentPubKey();

    const req: InstallAppRequest = {
      installed_app_id: `${agentName}_habits_personal`,
      agent_key,
      //@ts-ignore
      membrane_proofs: {},
      bundle: {
        manifest: {
          manifest_version: "1",
          name: "habit_fract",
          description: "",
          roles: [
            {
              name: "habits_dna",
              provisioning: {
                //@ts-ignore
                strategy: "create",
                deferred: false,
              },
              dna: {
                //@ts-ignore
                modifiers: {
                  //@ts-ignore
                  properties: {
                  },
                },
                //@ts-ignore
                path: habits_dna,
              },
            },
          ],
        },
        resources: {},
      },
    };
    const agentHapp: AppInfo = await admin.installApp(req);
    const ssCellInfo: CellInfo = agentHapp.cell_info["habits_dna"][0];
    habits_cell =
      CellType.Provisioned in ssCellInfo
        ? (ssCellInfo[CellType.Provisioned] as ProvisionedCell).cell_id
        : habits_cell;
        
    await admin.enableApp({ installed_app_id: agentHapp.installed_app_id });
    // console.log("app installed", agentHapp);
    const port = await conductor.attachAppInterface();
    appAgentWs = await conductor.connectAppAgentWs(
      port,
      agentHapp.installed_app_id
    );
    agentsHapps.push(agentHapp);
  } catch (e) {
    console.log("error has happened in installation: ", e);
    throw e;
  }

  return {
    agentsHapps,
    appAgentWs,
    agent_key,
    habits_cell
  };
};

export const setUpAliceandBob = async () => {
  const { servicesProcess, signalingServerUrl } = await runLocalServices();
  const alice_conductor = await createConductor(signalingServerUrl);
  const bob_conductor = await createConductor(signalingServerUrl);
  const {
    appAgentWs: alice,
    agentsHapps: alice_happs,
    agent_key: alice_agent_key,
    habits_cell: habits_cell_alice,
  } = await installAgent(
    alice_conductor,
    "alice"
  );
  const {
    appAgentWs: bob,
    agentsHapps: bob_happs,
    agent_key: bob_agent_key,
    habits_cell: habits_cell_bob,
  } = await installAgent(
    bob_conductor,
    "bob"
  );
  await addAllAgentsToAllConductors([alice_conductor, bob_conductor]);
  return {
    alice,
    bob,
    alice_conductor,
    bob_conductor,
    alice_happs,
    bob_happs,
    alice_agent_key,
    bob_agent_key,
    habits_cell_alice,
    habits_cell_bob,
    cleanup: async () => {
      await stopLocalServices(servicesProcess);
      await alice_conductor.shutDown();
      await bob_conductor.shutDown();
      await cleanAllConductors();
    },
  };
};
