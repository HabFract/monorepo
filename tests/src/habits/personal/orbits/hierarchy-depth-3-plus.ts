import { Orbit, Sphere } from './../../../../../ui/src/graphql/generated/index';
import { EntryRecord } from '@holochain-open-dev/utils/dist/entry-record';;
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
import { setUpAliceandBob } from "../../../../utils-backend";
import { anOrbit, aSphere, setupSphere } from './utils';
const { test } = pkg;

export default () => {
  test("Orbit Hierarchy Happy Path - Depth >= 3", async (t) => {
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

        // And Given Alice then creates an Orbit with otherwise valid input, using the hash as a sphereHash 
        const createOrbitResponse = await callZomeAlice(
          "personal",
          "create_my_orbit",
          anOrbit({sphereHash: encodeHashToBase64(hash)})
        );
        t.ok(createOrbitResponse, 'an orbit was created,');

        const orbitHash = encodeHashToBase64(new EntryRecord<Orbit>(createOrbitResponse).entryHash);
        // And Given Alice then creates another Orbit with otherwise valid input, using the hash as a sphereHash and the new Orbit's hash as a parentHash 
        const createOrbitResponse2 = await callZomeAlice(
          "personal",
          "create_my_orbit",
          anOrbit({sphereHash: encodeHashToBase64(hash), parentHash: orbitHash})
        );
        t.ok(createOrbitResponse2, 'another orbit was created,');

        // When Alice then requests an orbit hierarchy
        const orbitHierarchyResponse = await callZomeAlice(
          "personal",
          "get_orbit_hierarchy_json",
          {orbitEntryHashB64: orbitHash}
        );
        t.ok(orbitHierarchyResponse, 'a root hierarchy can be generated,');
        // Then an Orbit hierarchy was returned

        const orbitHash2 = encodeHashToBase64(new EntryRecord<Orbit>(createOrbitResponse2).entryHash);
        t.equal(orbitHash2, orbitHierarchyResponse.children[0].content, 'with the correct children.');
        // And the children array of the hierarchy contains the second Orbit's entry hash


        // 2. Given Alice then creates a third Orbit with otherwise valid and different input, using the second Orbit's hash as a parentHash
        const createOrbitResponse3 = await callZomeAlice(
          "personal",
          "create_my_orbit",
          anOrbit({ name: 'A different name!', sphereHash: encodeHashToBase64(hash), parentHash: orbitHash2 })
        );
        t.ok(createOrbitResponse3, 'A third orbit was created,');

        // When Alice then requests an orbit hierarchy
        const orbitHierarchyResponse2 = await callZomeAlice(
          "personal",
          "get_orbit_hierarchy_json",
          { orbitEntryHashB64: orbitHash }
        );
        t.ok(orbitHierarchyResponse2, 'a second root hierarchy can be generated,');
        // Then an Orbit hierarchy was returned

        t.equal(orbitHash2, orbitHierarchyResponse2.children[0].content, 'the second orbit is a child of the first one,');
        // And the children array of the first Orbit's hierarchy contains the second Orbit's entry hash

        const orbitHash3 = encodeHashToBase64(new EntryRecord<Orbit>(createOrbitResponse3).entryHash);
        t.equal(orbitHash3, orbitHierarchyResponse2.children[0].children[0].content, 'the third orbit is a child of the second one.');
        // And the children array of the second Orbit's hierarchy contains the third Orbit's entry hash


        // 3. Given Alice then creates a fourth Orbit with otherwise valid and different input, using the third Orbit's hash as a parentHash
        const createOrbitResponse4 = await callZomeAlice(
          "personal",
          "create_my_orbit",
          anOrbit({ name: 'A second different name!', sphereHash: encodeHashToBase64(hash), parentHash: orbitHash3 })
        );
        t.ok(createOrbitResponse4, 'A third orbit was created,');

        // When Alice then requests an orbit hierarchy
        const orbitHierarchyResponse3 = await callZomeAlice(
          "personal",
          "get_orbit_hierarchy_json",
          { orbitEntryHashB64: orbitHash }
        );
        t.ok(orbitHierarchyResponse3, 'a third root hierarchy can be generated,');
        // Then an Orbit hierarchy was returned
// console.log('orbitHierarchyResponse3 :>> LVL 0 ', orbitHierarchyResponse3);
// console.log('orbitHierarchyResponse3 :>> LVL 1 ', orbitHierarchyResponse3.children);
// console.log('orbitHierarchyResponse3 :>> LVL 2 ', orbitHierarchyResponse3.children[0].children);
// console.log('orbitHierarchyResponse3 :>> LVL 3 ', orbitHierarchyResponse3.children[0].children[0].children);
        t.equal(orbitHash2, orbitHierarchyResponse3.children[0].content, 'the second orbit is a child of the first one,');
        // And the children array of the first Orbit's hierarchy contains the second Orbit's entry hash

        const orbitHash4 = encodeHashToBase64(new EntryRecord<Orbit>(createOrbitResponse4).entryHash);
        t.equal(orbitHash3, orbitHierarchyResponse3.children[0].children[0].content, 'the third orbit is a child of the second one,');
        // And the children array of the second Orbit's hierarchy contains the third Orbit's entry hash

        t.equal(orbitHash4, orbitHierarchyResponse3.children[0].children[0].children[0].content, 'the fourth orbit is a child of the third one.');
        // And the children array of the third Orbit's hierarchy contains the fourth Orbit's entry hash

      } catch (e) {
        t.ok(null);
      }
      await cleanup();
    });
  });

  test.skip("Orbit Hierarchy Sad Path - Depth >= 3", async (t) => {
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

