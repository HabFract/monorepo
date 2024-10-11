import { decode } from '@msgpack/msgpack';
import {
  encodeHashToBase64,
} from "@holochain/client";

import { pause, runScenario } from "@holochain/tryorama";
import pkg from "tape-promise/tape";
import { setUpAliceandBob } from "../../../../utils-backend";
import { anOrbit, setupSphere } from '../../personal/orbits/utils';
import { aWinRecord } from '../../../../../ui/src/graphql/generated/mocks';
import { Orbit } from "../../../../../ui/src/graphql/generated";
import { EntryRecord } from "@holochain-open-dev/utils";

const { test } = pkg;

export default () => {
  test("Win Record CRUD - Happy path", async (t) => {
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

      const callZomeAlice = async (zome_name, fn_name, payload) => {
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
        const pauseDuration = 1000;
        await scenario.shareAllAgents();
        await pause(pauseDuration);

        // 1. Given a Sphere has been created and we know its hash
        // And an Orbit has been created and we know its hash
        const hash1 = await setupSphere(callZomeAlice);
        const createOrbitResponse = await callZomeAlice(
          "personal",
          "create_my_orbit",
          anOrbit({sphereHash: encodeHashToBase64(hash1)})
        );
        const hash2 =  new EntryRecord<Orbit>(createOrbitResponse)?.entryHash;
        t.ok(hash1 && hash2, "A sphere was created with an orbit linked to it,");

        // When Alice then creates a WinRecord with otherwise valid input, using the hash as an OrbitId 
        const winData = {"01/01/2021": {single: true}};
        const createWinRecordResponse = await callZomeAlice(
          "personal",
          "create_my_win_record",
          aWinRecord({orbitId: encodeHashToBase64(hash2), winData})
        );
        t.ok(createWinRecordResponse, 'a win record was created,');
        // Then the WinRecord was created
        
      } catch (e) {
        t.ok(null);
      }
      await cleanup();
    });
  });
};

