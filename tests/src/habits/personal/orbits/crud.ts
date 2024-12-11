import { Orbit, Sphere } from './../../../../../ui/src/graphql/generated/index';
import { EntryRecord } from '@holochain-open-dev/utils/dist/entry-record';
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
  test("Orbit CRUD - Happy path", async (t) => {
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

        const orbitActionHash = encodeHashToBase64(new EntryRecord<Orbit>(createOrbitResponse).actionHash);
        const orbitGetResponse = await callZomeAlice(
          "personal",
          "get_my_orbit",
          orbitActionHash
        );
        // And When get_orbit is called
        const orbitRecord = new EntryRecord<Orbit>(orbitGetResponse);
        t.ok(orbitGetResponse, 'an orbit can be retrieved.');
        // Then Orbit can be retrieved


        // 2. Given Alice then creates another Orbit with otherwise valid input, using the hash as a sphereHash and the new Orbit's hash as a parentHash 
        const createOrbitResponse2 = await callZomeAlice(
          "personal",
          "create_my_orbit",
          anOrbit({name: 'A new name', sphereHash: encodeHashToBase64(hash), parentHash: encodeHashToBase64(orbitRecord.entryHash)})
        );
        t.ok(createOrbitResponse2, 'Another Orbit was created,');
        // Then the Orbit was created

        const orbitActionHash2 = encodeHashToBase64(new EntryRecord<Orbit>(createOrbitResponse2).actionHash);
        // When Alice updates the second orbit to have a new name 
        const updatedOrbit = anOrbit({
          name: 'A completely different name', sphereHash: encodeHashToBase64(hash), parentHash: encodeHashToBase64(orbitRecord.entryHash)
        });
        const updateOrbitResponse = await callZomeAlice(
          "personal",
          "update_orbit",
          {
            originalOrbitHash: orbitActionHash2,
            updatedOrbit
          }
        );
        t.ok(updateOrbitResponse, 'the orbit was updated,');
        const updatedOrbitHash = new EntryRecord<Orbit>(updateOrbitResponse).actionHash;
        // Then the Orbit was updated

        // And When get_orbit is called with the *original* hash
        const orbitGetResponse2 = await callZomeAlice(
          "personal",
          "get_my_orbit",
          orbitActionHash2
        );
        t.ok(orbitGetResponse2, 'an orbit can be retrieved from the original hash,');
        // Then it return a response
        
        const orbitRecord2 = new EntryRecord<Orbit>(orbitGetResponse2);
        t.equal(updatedOrbit.name, orbitRecord2.entry.name, 'with the updated name, or')
        // And it has the updated orbit name

        // And When get_orbit is called with the *update* action hash
        const orbitGetResponse3 = await callZomeAlice(
          "personal",
          "get_my_orbit",
          updatedOrbitHash
        );

        t.ok(orbitGetResponse3, 'an orbit can be retrieved from the update hash,');
        const orbitRecord3 = new EntryRecord<Orbit>(orbitGetResponse3);
        t.equal(updatedOrbit.name, orbitRecord3.entry.name, 'with the updated name.')
        // Then it returns the updated entry
        

        // 3. Given Alice already created two orbits
        const orbitGetAllResponse = await callZomeAlice(
          "personal",
          "get_all_my_sphere_orbits",
          {sphereHash: encodeHashToBase64(hash)}
        );
        t.equal(2, orbitGetAllResponse?.length, 'Two orbits exist,');

        // When Alice deletes the updated orbit
        const orbitDeleteResponse = await callZomeAlice(
          "personal",
          "delete_orbit",
          updatedOrbitHash
        );
        t.ok(orbitDeleteResponse, 'an updated orbit can be deleted,');
        const orbitGetAllResponse2 = await callZomeAlice(
          "personal",
          "get_all_my_sphere_orbits",
          {sphereHash: encodeHashToBase64(hash)}
        );
        t.equal(1, orbitGetAllResponse2.length, 'one orbit exists,');
        // Then another get_all returns only 1 orbit
          
        const entryRecords2 = orbitGetAllResponse2.map(orbit => new EntryRecord<Orbit>(orbit).entry);
        t.equal(orbitRecord.entry.name, entryRecords2[0].name, 'and it is the first orbit, not the updated orbit.')
        // And it returns the not-deleted entry


        // 4. Given Alice deleted all but the first orbit, When we delete the first orbit
        const orbitDeleteResponse2 = await callZomeAlice(
          "personal",
          "delete_orbit",
          orbitActionHash
        );
        t.ok(orbitDeleteResponse2, 'A created orbit can be deleted,');
        const orbitGetAllResponse3 = await callZomeAlice(
          "personal",
          "get_all_my_sphere_orbits",
          {sphereHash: encodeHashToBase64(hash)}
        );
        t.equal(0, orbitGetAllResponse3.length, 'an empty array is returned from get_all,');
        // Then another get_all returns an empty array

        const orbitGetResponse4 = await callZomeAlice(
          "personal",
          "get_my_orbit",
          orbitActionHash
        );
        // And When get_orbit is called
        const noOrbitRecord = new EntryRecord<Orbit>(orbitGetResponse4);
        t.equal(null, noOrbitRecord.record, 'and a null record is returned from get.');
        // Then a null record is returned
        
      } catch (e) {
        t.ok(null);
      }
      await cleanup();
    });
  });

  test.skip("Orbit CRUD - Sad path", async (t) => {
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

