import { Orbit, Sphere } from './../../../../../app/src/graphql/generated/index';
import { EntryRecord } from '@holochain-open-dev/utils';
import {
  encodeHashToBase64,
} from "@holochain/client";

import { pause, runScenario } from "@holochain/tryorama";
import pkg from "tape-promise/tape";
import { setUpAliceandBob } from "../../../../utils";
import { aSphere, anOrbit, createOrbitChildren, setupSphere } from './utils';
const { test } = pkg;

export default () => {
  test("Orbit Hierarchy Happy Path - Depth <= 2", async (t) => {
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
        const hash = await setupSphere(callZomeAlice);
        t.ok(hash, "A sphere was created,");

        // When Alice then creates an Orbit with otherwise valid input, using the hash as a sphereHash 
        const createOrbitResponse = await callZomeAlice(
          "personal",
          "create_my_orbit",
          anOrbit({sphereHash: encodeHashToBase64(hash)})
        );
        t.ok(createOrbitResponse, 'an orbit was created,');
        // Then the Orbit was created

        // And When Alice then requests an orbit hierarchy
        const orbitHash = encodeHashToBase64(new EntryRecord<Orbit>(createOrbitResponse).entryHash);
        const orbitHierarchyResponse = await callZomeAlice(
          "personal",
          "get_orbit_hierarchy_json",
          {orbitEntryHashB64: orbitHash}
          );
        t.ok(orbitHierarchyResponse, 'a hierarchy can be generated,');
        // Then an Orbit hierarchy was returned
        t.equal(orbitHierarchyResponse.children.length, 0, 'with no children.');
        // And the Orbit hierarchy has no children

        // 2. Given Alice then creates another two Orbits with otherwise valid input, using the hash as a sphereHash and the new Orbit's hash as a parentHash 
        const childOrbits = await createOrbitChildren(callZomeAlice, encodeHashToBase64(hash), orbitHash, 2);
        t.equal(childOrbits.length, 2, 'Two child orbits were created,');

        // And When the orbit hierarchy is requested for the first orbit
        const orbitHierarchyResponse2 = await callZomeAlice(
          "personal",
          "get_orbit_hierarchy_json",
          {orbitEntryHashB64: orbitHash}
        );
        t.ok(orbitHierarchyResponse2, 'another hierarchy can be generated,');
        // Then an Orbit hierarchy was returned

        t.equal(orbitHierarchyResponse2.children.length, 2, 'orbit 1 has two children');
        
        const childOrbitHashes = childOrbits.map(child => encodeHashToBase64(child.entryHash));
        const hierarchyChildrenContents = orbitHierarchyResponse2.children.map(child => child.content);
        const secondHasFirst = hierarchyChildrenContents.includes(childOrbitHashes[0]);
        const secondHasSecond = hierarchyChildrenContents.includes(childOrbitHashes[1]);
        t.ok(secondHasFirst && secondHasSecond, 'and those children have their hashes as content.')
        // And the hierarchy should show the first orbit as the parent of the second and third orbits

      } catch (e) {
        t.ok(null);
      }
      await cleanup();
    });
  });

  test.skip("Orbit Hierarchy Sad Path - Depth <= 2", async (t) => {
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

