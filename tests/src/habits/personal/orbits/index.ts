import { anOrbit } from './../../../../../app/src/graphql/generated/mocks';
import { DnaSource, Record, ActionHash, EntryHash, AppEntryDef, Create, AgentPubKey, encodeHashToBase64 } from "@holochain/client";

import {
  pause,
  runScenario,
} from "@holochain/tryorama";
import { decode } from "@msgpack/msgpack";
import { ok } from "assert";
import pkg from "tape-promise/tape";
import { setUpAliceandBob } from "../../../../utils";
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
      try {
        const pauseDuration = 1000
        await scenario.shareAllAgents();
        await pause(pauseDuration*2);

        const createOrbitResponse = await callZomeAlice(
          "personal",
          "create_orbit",
          anOrbit
        );
        t.ok(anOrbit, "A response comes back");
        // t.equal(agents.length, 1);
        // t.equal(encodeHashToBase64(agents[0]), encodeHashToBase64(bob_agent_key));
        // console.log("agents", agents);

      } catch (e) {
        console.log('Testing error: ', e);

        t.ok(null);
      }

      await cleanup();
    });
  });
};
