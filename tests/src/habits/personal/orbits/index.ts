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
const { test } = pkg;

function aSphere(overrides?): any {
  return {
      id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : '14830037-c822-4498-8463-d3354c2fce66',
      metadata: overrides && overrides.hasOwnProperty('metadata') ? overrides.metadata! : {
        description: "This is a nice sphere",
        hashtag: 'TheBestSphere',
      },
      name: overrides && overrides.hasOwnProperty('name') ? overrides.name! : 'est',
  };
}

const anOrbit = (overrides?) => {
  return {
    frequency:
      overrides && overrides.hasOwnProperty("frequency")
        ? overrides.frequency!
        : "Day",
    metadata:
      overrides && overrides.hasOwnProperty("metadata")
        ? overrides.metadata!
        : {
            description: "This is a nice orbit",
            timeframe: {
              startTime: 1704020400000,
              endTime: undefined,
            },
          },
    name:
      overrides && overrides.hasOwnProperty("name")
        ? overrides.name!
        : "tempora",
    parentHash:
      overrides && overrides.hasOwnProperty("parentHash")
        ? overrides.parentHash!
        : undefined,
    scale:
      overrides && overrides.hasOwnProperty("scale")
        ? overrides.scale!
        : "Astro",
    sphereHash:
      overrides && overrides.hasOwnProperty("sphereHash")
        ? overrides.sphereHash!
        : "ducimus",
  };
};

export default () => {
  test("Orbit Hierarchy Happy Path", async (t) => {
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

        // And When Alice then requests an orbit hierarchy
        const orbitHash = encodeHashToBase64(new EntryRecord<Orbit>(createOrbitResponse).entryHash);
        const orbitHierarchyResponse = await callZomeAlice(
          "personal",
          "get_orbit_hierarchy_json",
          {orbitEntryHashB64: orbitHash}
          );
        // Then an Orbit hierarchy was returned
        t.ok(orbitHierarchyResponse, 'a hierarchy can be generated');

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


        // 2. Given Alice then creates another Orbit with otherwise valid input, using the hash as a sphereHash and the new Orbit's hash as a parentHash 
        const createOrbitResponse2 = await callZomeAlice(
          "personal",
          "create_my_orbit",
          anOrbit({sphereHash: encodeHashToBase64(hash), parentHash: orbitHash})
        );
        t.ok(createOrbitResponse, 'another Orbit was created');
        // Then the Orbit was created

        // And When Alice then requests an orbit hierarchy
        const orbitHierarchyResponse2 = await callZomeAlice(
          "personal",
          "get_orbit_hierarchy_json",
          {orbitEntryHashB64: orbitHash}
          );
        // Then an Orbit hierarchy was returned
        t.ok(orbitHierarchyResponse, 'another hierarchy can be generated');

        // And the children array of the hierarchy contains the second Orbit's entry hash

        const orbitHash2 = encodeHashToBase64(new EntryRecord<Orbit>(createOrbitResponse2).entryHash);
        t.equal(orbitHash2, orbitHierarchyResponse2.children[0].id, 'another hierarchy can be generated');

        
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

  test.skip("Orbit Hierarchy Sad Path", async (t) => {
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

