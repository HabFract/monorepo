import { pause, runScenario } from "@holochain/tryorama";
import pkg from "tape-promise/tape";
import { setUpAliceandBob } from "../../../../utils";
import { anOrbit, setupHierarchy3 } from './utils';
import { encodeHashToBase64 } from "@holochain/client";
const { test } = pkg;

export default () => {
  test("Orbit Hierarchy (Prepend Node CRUD & Levels) Happy Path Depth upto 3", async (t) => {
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

        // 1. Given a Sphere has been created and we know its hash, and a balanced hierarchy of depth 3 has been created,
        const [sphereHash, rootHash, c0, c1, c0_0, c0_1, c1_0, c1_1] = await setupHierarchy3(callZomeAlice);
        t.ok(rootHash && c0 && c1 && c0_0 && c0_1 && c1_0 && c1_1, 'A hierarchy of depth 3 has been created,');

        // When I try to the lowest level tag of this hierarchy
        const sphereLowestLevelResponse = await callZomeAlice(
          "personal",
          "get_lowest_sphere_hierarchy_level",
          sphereHash
        );
        t.equal(0, sphereLowestLevelResponse, 'and its lowest level link tag value is 0.');
        // I get the default starting level of 0

        // 2. Given Alice then creates another Orbit with otherwise valid input, using the root orbit's hash as a childHash 
        const prependOrbitResponse = await callZomeAlice(
          "personal",
          "create_my_orbit",
          anOrbit({name: 'A new name', sphereHash, childHash: rootHash})
        );
        t.ok(prependOrbitResponse, 'Another Orbit was created,');
        // Then the Orbit was created

        // And When I try to the lowest level tag of this hierarchy
        const sphereLowestLevelResponse2 = await callZomeAlice(
          "personal",
          "get_lowest_sphere_hierarchy_level",
          sphereHash
        );
        t.equal(-1, sphereLowestLevelResponse2, 'and its level link tag value is -1.');
        // I get the default starting level of 0

      } catch (e) {
        t.ok(null);
      }
      await cleanup();
    });
  });

};
