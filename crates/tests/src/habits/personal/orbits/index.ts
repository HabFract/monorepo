import { DnaSource, Record, ActionHash, EntryHash, AppEntryDef, Create, AgentPubKey, encodeHashToBase64 } from "@holochain/client";
import {
  pause,
  runScenario,
  Scenario,
  createConductor,
  addAllAgentsToAllConductors,
  cleanAllConductors,
} from "@holochain/tryorama";
import { decode } from "@msgpack/msgpack";
import { ok } from "assert";
import pkg from "tape-promise/tape";
import { installAgent, sampleAppletConfig, setUpAliceandBob } from "../../utils";
const { test } = pkg;

export default () => {
  test("Orbit CRUD", async (t) => {
    await runScenario(async (scenario) => {
      const {
        alice,
        bob,
        cleanup,
        alice_agent_key,
        bob_agent_key,
        habits_cell_alice,
        habits_cell_bob,
      } = await setUpAliceandBob();

      const callZomeAlice = async (
        zome_name,
        fn_name,
        payload,
      ) => {
        return await alice.callZome({
          cap_secret: null,
          cell_id: habits_cell_alice,
          zome_name,
          fn_name,
          payload,
          provenance: alice_agent_key,
        });
      };
      const callZomeBob = async (
        zome_name,
        fn_name,
        payload,
      ) => {
        return await bob.callZome({
          cap_secret: null,
          cell_id: habits_cell_bob,
          zome_name,
          fn_name,
          payload,
          provenance: bob_agent_key,
        });
      };
      try {
        const pauseDuration = 1000
        await scenario.shareAllAgents();
        await pause(pauseDuration*2);

        let agents: Array<AgentPubKey> = await callZomeAlice(
          "personal",
          "get_all_agents",
          null
        );
        t.ok(agents);
        t.equal(agents.length, 0);
        console.log("agents", agents);
        // Wait for the created entry to be propagated to the other node.
        await pause(pauseDuration);

        // agents = await callZomeBob(
        //   "personal",
        //   "get_all_agents",
        //   null
        // );
        // t.ok(agents);
        // t.equal(agents.length, 1);
        // t.equal(encodeHashToBase64(agents[0]), encodeHashToBase64(alice_agent_key));
        // console.log("agents", agents);
        // await pause(pauseDuration);

        // agents = await callZomeAlice(
        //   "personal",
        //   "get_all_agents",
        //   null
        // );
        // t.ok(agents);
        // t.equal(agents.length, 1);
        // t.equal(encodeHashToBase64(agents[0]), encodeHashToBase64(bob_agent_key));
        // console.log("agents", agents);

      } catch (e) {
        console.log(e);
        t.ok(null);
      }

      await cleanup();
    });
  });
};
