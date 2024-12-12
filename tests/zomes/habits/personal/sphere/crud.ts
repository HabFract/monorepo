import { Orbit, Sphere } from "../../../../../ui/src/graphql/generated";
import { EntryRecord } from "@holochain-open-dev/utils/dist/entry-record";
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
import {
  aSphere,
  setupSphere,
  setupSphereAsEntryRecord,
} from "../orbits/utils";
const { test } = pkg;

export default () => {
  test("Sphere CRUD - Happy path", async (t) => {
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

        // 1. Given no Sphere has been created
        // When Alice then creates a Sphere with valid input
        const hash = (await setupSphereAsEntryRecord(callZomeAlice, undefined))
          .actionHash;
        t.ok(hash, "A sphere was created, ");

        const sphereGetResponse = await callZomeAlice(
          "personal",
          "get_my_sphere",
          encodeHashToBase64(hash)
        );
        // And When get_my_sphere is called
        const sphereRecord = new EntryRecord<Sphere>(sphereGetResponse);
        t.ok(sphereGetResponse, "a sphere can be retrieved.");
        // Then Sphere can be retrieved

        // 2. Given Alice then creates another Sphere with other valid and distinct input
        const hash2 = (
          await setupSphereAsEntryRecord(callZomeAlice, {
            name: "Health and fitness",
          })
        ).actionHash;
        t.ok(hash2, "Another Sphere was created,");
        // Then the Sphere was created

        // When Alice updates the second Sphere to have a new name
        const updatedSphere = aSphere({
          name: "A completely different name other than Health and Fitness",
        });
        const updateSphereResponse = await callZomeAlice(
          "personal",
          "update_sphere",
          {
            originalSphereHash: encodeHashToBase64(hash2),
            updatedSphere,
          }
        );
        t.ok(updateSphereResponse, "the Sphere was updated,");
        // Then the Sphere was updated

        const updatedSphereHash = new EntryRecord<Sphere>(updateSphereResponse)
          .actionHash;

        // And When get_my_sphere is called with the *original* hash
        const sphereGetResponse2 = await callZomeAlice(
          "personal",
          "get_my_sphere",
          encodeHashToBase64(hash2)
        );
        t.ok(
          sphereGetResponse2,
          "a Sphere can be retrieved from the original hash,"
        );
        // Then it return a response

        const sphereRecord2 = new EntryRecord<Sphere>(sphereGetResponse2);
        t.equal(
          updatedSphere.name,
          sphereRecord2.entry.name,
          "with the updated name, or"
        );
        // And it has the updated sphere name

        // And When get_sphere is called with the *update* action hash
        const sphereGetResponse3 = await callZomeAlice(
          "personal",
          "get_my_sphere",
          encodeHashToBase64(updatedSphereHash)
        );

        t.ok(
          sphereGetResponse3,
          "a sphere can be retrieved from the update hash,"
        );
        const sphereRecord3 = new EntryRecord<Sphere>(sphereGetResponse3);
        t.equal(
          updatedSphere.name,
          sphereRecord3.entry.name,
          "with the updated name."
        );
        // Then it returns the updated entry

        // 3. Given Alice already created two spheres
        const sphereGetAllResponse = await callZomeAlice(
          "personal",
          "get_all_my_spheres",
          null
        );
        t.equal(2, sphereGetAllResponse?.length, "Two spheres exist,");

        // When Alice deletes the updated sphere
        const sphereDeleteResponse = await callZomeAlice(
          "personal",
          "delete_sphere",
          updatedSphereHash
        );
        t.ok(sphereDeleteResponse, "an updated sphere can be deleted,");
        const sphereGetAllResponse2 = await callZomeAlice(
          "personal",
          "get_all_my_spheres",
          null
        );
        t.equal(1, sphereGetAllResponse2.length, "one sphere exists,");
        // Then another get_all returns only 1 sphere

        const entryRecords2 = sphereGetAllResponse2.map(
          (sphere) => new EntryRecord<Sphere>(sphere).entry
        );
        t.equal(
          sphereRecord.entry.name,
          entryRecords2[0].name,
          "and it is the first sphere, not the updated sphere."
        );
        // And it returns the not-deleted entry

        // 4. Given Alice deleted all but the first sphere, When we delete the first sphere
        const sphereDeleteResponse2 = await callZomeAlice(
          "personal",
          "delete_sphere",
          encodeHashToBase64(hash)
        );
        t.ok(sphereDeleteResponse2, "A created sphere can be deleted,");
        const sphereGetAllResponse3 = await callZomeAlice(
          "personal",
          "get_all_my_spheres",
          null
        );
        t.equal(
          0,
          sphereGetAllResponse3.length,
          "an empty array is returned from get_all,"
        );
        // Then another get_all returns an empty array

        const sphereGetResponse4 = await callZomeAlice(
          "personal",
          "get_my_sphere",
          encodeHashToBase64(hash)
        );
        // And When get_my_sphere is called
        const noSphereRecord = new EntryRecord<Sphere>(sphereGetResponse4);
        t.equal(
          null,
          noSphereRecord.record,
          "and a null record is returned from get."
        );
        // Then a null record is returned
      } catch (e) {
        t.ok(null);
      }
      await cleanup();
    });
  });

  test.skip("Sphere CRUD - Sad path", async (t) => {
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
          { orbitEntryHashB64: null }
        );
        // And an Orbit hierarchy was returned
        t.ok(orbitHierarchyResponse, "a hierarchy can not be generated");
      } catch (e) {
        t.ok(null);
      }
      await cleanup();
    });
  });
};
