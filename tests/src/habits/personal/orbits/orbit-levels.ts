import { Orbit, Sphere } from './../../../../../app/src/graphql/generated/index';
import { EntryRecord } from '@holochain-open-dev/utils';
import {
  DnaSource,
  Record,
  ActionHash,
  EntryHash,
  AppEntryDef,
  Create,
  AgentPubKey,
  encodeHashToBase64,
} from "@holochain/client";

import { pause, runScenario } from "@holochain/tryorama";
import pkg from "tape-promise/tape";
import { setUpAliceandBob } from "../../../../utils";
import { anOrbit, aSphere, setupHierarchy, setupSphere } from './utils';
const { test } = pkg;

export default () => {
  test("Orbit Hierarchy (Levels) Happy Path", async (t) => {
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
        const [sphereHash, rootHash, c0, c1, c0_0, c0_1, c1_0, c1_1] = await setupHierarchy(callZomeAlice);
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

  test.skip("Orbit Hierarchy (Levels) Sad Path", async (t) => {
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
        console.log('orbitHierarchyResponse2 :>> ', orbitHierarchyResponse);
        t.ok(orbitHierarchyResponse, 'a hierarchy can not be generated');
      } catch (e) {
        t.ok(null);
      }
      await cleanup();
    });
  });
};
