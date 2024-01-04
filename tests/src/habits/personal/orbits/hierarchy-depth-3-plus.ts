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
import { anOrbit, aSphere } from './utils';
const { test } = pkg;

export default () => {
  test.skip("Orbit Hierarchy Happy Path - Depth >= 3", async (t) => {
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

        // 1. Given a Sphere has been created and we know its hash
        const hash = await setupSphere();
        t.ok(hash, "A sphere was created");

        // When Alice then creates an Orbit with otherwise valid input, using the hash as a sphereHash 
        const createOrbitResponse = await callZomeAlice(
          "personal",
          "create_my_orbit",
          anOrbit({sphereHash: encodeHashToBase64(hash)})
        );
        t.ok(createOrbitResponse, 'an Orbit was created');
        // Then the Orbit was created

        const orbitActionHash = encodeHashToBase64(new EntryRecord<Orbit>(createOrbitResponse).actionHash);
        const orbitGetResponse = await callZomeAlice(
          "personal",
          "get_orbit",
          orbitActionHash
        );
        // And When get_orbit is called
        const orbitRecord = new EntryRecord<Orbit>(orbitGetResponse);
        // Then Orbit can be retrieved
        t.ok(orbitGetResponse, 'an orbit can be retrieved');


        // // 2. Given Alice then creates another Orbit with otherwise valid input, using the hash as a sphereHash and the new Orbit's hash as a parentHash 
        // const createOrbitResponse2 = await callZomeAlice(
        //   "personal",
        //   "create_my_orbit",
        //   anOrbit({sphereHash: encodeHashToBase64(hash), parentHash: orbitHash})
        // );
        // t.ok(createOrbitResponse, 'another Orbit was created');
        // // Then the Orbit was created

        // // And When Alice then requests an orbit hierarchy
        // const orbitHierarchyResponse2 = await callZomeAlice(
        //   "personal",
        //   "get_orbit_hierarchy_json",
        //   {orbitEntryHashB64: orbitHash}
        //   );
        // // Then an Orbit hierarchy was returned
        // t.ok(orbitHierarchyResponse, 'another hierarchy can be generated');

        // // And the children array of the hierarchy contains the second Orbit's entry hash

        // const orbitHash2 = encodeHashToBase64(new EntryRecord<Orbit>(createOrbitResponse2).entryHash);
        // t.equal(orbitHash2, orbitHierarchyResponse2.children[0].id, 'another hierarchy can be generated');

        // // 3. Given Alice then creates a third Orbit with otherwise valid and different input, using the second Orbit's hash as a parentHash
        // const createOrbitResponse3 = await callZomeAlice(
        //   "personal",
        //   "create_my_orbit",
        //   anOrbit({ name: 'A different name!', sphereHash: encodeHashToBase64(hash), parentHash: orbitHash2 })
        // );
        // t.ok(createOrbitResponse3, 'a third Orbit was created');
        // // Then the Orbit was created

        // // And When Alice then requests an orbit hierarchy
        // const orbitHierarchyResponse3 = await callZomeAlice(
        //   "personal",
        //   "get_orbit_hierarchy_json",
        //   { orbitEntryHashB64: orbitHash }
        // );
        // // Then an Orbit hierarchy was returned
        // t.ok(orbitHierarchyResponse3, 'a third hierarchy can be generated');

        // // And the children array of the first Orbit's hierarchy contains the second Orbit's entry hash
        // t.equal(orbitHash2, orbitHierarchyResponse3.children[0].id, 'the second Orbit is a child of the first one');

        // console.log('orbitHierarchyResponse,orbitHierarchyResponse2 :>> ', orbitHierarchyResponse3);
        // // And the children array of the second Orbit's hierarchy contains the third Orbit's entry hash
        // const orbitHash3 = encodeHashToBase64(new EntryRecord<Orbit>(createOrbitResponse3).entryHash);
        // t.equal(orbitHash3, orbitHierarchyResponse3.children[0].children[0].id, 'the third Orbit is a child of the second one');
        
      } catch (e) {
        t.ok(null);
      }
      await cleanup();

      async function setupSphere() {
        const createSphereResponse = await callZomeAlice(
          "personal",
          "create_sphere",
          aSphere()
        );
        t.ok(createSphereResponse, "A response comes back");

        return new EntryRecord<Sphere>(createSphereResponse).entryHash;
      }
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


      async function setupSphere() {
        const createSphereResponse = await callZomeAlice(
          "personal",
          "create_sphere",
          aSphere()
        );
        t.ok(createSphereResponse, "A response comes back");

        return new EntryRecord<Sphere>(createSphereResponse).entryHash;
      }
    });
  });
};

