import { pause, runScenario } from "@holochain/tryorama";
import pkg from "tape-promise/tape";
import { setUpAliceandBob } from "../../../../utils";
import { anOrbit, aSphere, createOrbitChildren, serializeAsyncActions, setupHierarchy3, setupHierarchy4, setupHierarchy5, setupSphere } from './utils';
import { encodeHashToBase64 } from "@holochain/client";
import { Orbit } from "../../../../../app/src/graphql/generated";
const { test } = pkg;

export default () => {
  test("Orbit Hierarchy (Levels) Happy Path Depth upto 3", async (t) => {
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
        const rootHierarchyResponse = await callZomeAlice(
          "personal",
          "get_orbit_hierarchy_json",
          {orbitEntryHashB64: rootHash}
        );
        t.ok(rootHierarchyResponse, 'with JSON returned,');
        // When I try to get a hierarchy from level 0
        const level0HierarchyResponse = await callZomeAlice(
          "personal",
          "get_orbit_hierarchy_json",
          {levelQuery: {orbitLevel: 0, sphereHashB64: sphereHash}}
        );
        t.ok(level0HierarchyResponse, 'and a query to level 0 returned JSON,');
        t.equal(level0HierarchyResponse.level_trees.length, 1, 'returns an array of length 1.');
        // Then it returns an array of 1 hierarchy.
        t.deepEqual(level0HierarchyResponse.level_trees[0], rootHierarchyResponse)
        // And the root orbitEntryHash hierarchy reponse is the same as the only element of the array

        // And When I try to get a hierarchy from level 1
        const level1HierarchyResponse = await callZomeAlice(
          "personal",
          "get_orbit_hierarchy_json",
          {levelQuery: {orbitLevel: 1, sphereHashB64: sphereHash}}
        );
        t.ok(level1HierarchyResponse, 'and a query to level 1 returned JSON,');
        t.equal(level1HierarchyResponse.level_trees.length, 2, 'returns an array of length 2.');
        // Then it returns an array of 2 hierarchies, 

        // And When I try to get a hierarchy from level 2
        const level2HierarchyResponse = await callZomeAlice(
          "personal",
          "get_orbit_hierarchy_json",
          {levelQuery: {orbitLevel: 2, sphereHashB64: sphereHash}}
        );
        t.ok(level2HierarchyResponse, 'and a query to level 2 returned JSON,');
        t.equal(level2HierarchyResponse.level_trees.length, 4, 'returns an array of length 4.');
        // Then it returns an array of 4 hierarchies.
      } catch (e) {
        t.ok(null);
      }
      await cleanup();
    });
  });

  test.only("Orbit Hierarchy (Levels) Happy Path Depth upto 5", async (t) => {
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

        // 1. Given a Sphere has been created and we know its hash, and a balanced hierarchy of depth 4 has been created,
        const [sphereHash4, l0, l10, l11, l20, l21, l22, l23, l30, l31, l32, l33 ] = await setupHierarchy4(callZomeAlice);
        t.ok(l0 && l10 && l11 && l20 && l21 && l22 && l23 && l30 && l31 && l32 && l33, 'A hierarchy of depth 4 has been created,');
        
        // When I try to get a hierarchy from level 0
        const level0HierarchyResponse = await callZomeAlice(
          "personal",
          "get_orbit_hierarchy_json",
          {levelQuery: {orbitLevel: 0, sphereHashB64: sphereHash4}}
        );
        t.ok(level0HierarchyResponse, 'and a query to level 0 returned JSON,');
        t.equal(level0HierarchyResponse.level_trees.length, 1, 'returns an array of length 1.');
        // Then it returns an array of 1 hierarchy.
        t.equal(level0HierarchyResponse.level_trees[0].children[0].children[0].children.length, 0, 'with a depth of 3, as the tree is balanced and depth first traversal to the 3rd level produced a leaf node.');
        // And the one element of the array has a depth of 3, not 4.

        // 2. Given a Sphere has been created and we know its hash, and a balanced hierarchy of depth 5 has been created,
        const [sphereHash5, l05, l105, l115, l205, l215, l225, l235, l305, l315, l325, l335, l40, l41, l42, l43 ] = await setupHierarchy5(callZomeAlice);
        t.ok(l05 && l105 && l115 && l205 && l215 && l225 && l235 && l305 && l315 && l325 && l335 && l40 && l41 && l42 && l43, 'A hierarchy of depth 5 has been created,');
        
        await pause(pauseDuration);
        

      } catch (e) {
        t.ok(null);
      }
      await cleanup();
    });
  });

  test.skip("Orbit Hierarchy (Levels) Sad Path Depth upto 3", async (t) => {
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
        console.log('payload :>> ', payload);
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

        // 2. Given a Sphere has not been created And an Orbit has not been created
        // When Alice then requests an orbit hierarchy
        const orbitHierarchyResponse = await callZomeAlice(
          "personal",
          "get_orbit_hierarchy_json",
          {orbitEntryHashB64: null}
          );
        // And an Orbit hierarchy was returned
        
        t.ok(orbitHierarchyResponse, 'a hierarchy can not be generated');

      } catch (e) {
        t.ok(null);
      }
      await cleanup();
    });
  });
};
