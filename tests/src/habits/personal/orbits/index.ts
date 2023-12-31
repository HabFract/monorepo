import { Sphere } from './../../../../../app/src/graphql/generated/index';
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
import { decode } from "@msgpack/msgpack";
import { ok } from "assert";
import pkg from "tape-promise/tape";
import { setUpAliceandBob } from "../../../../utils";
const { test } = pkg;

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
  test("Orbit CRUD", async (t) => {
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
        await pause(pauseDuration * 2);

        // 1. Given a Sphere has been created and we know its hash
        const hash = await setupSphere();
        t.ok(hash, "A sphere was created");

        const createOrbitResponse = await callZomeAlice(
          "personal",
          "create_orbit",
          anOrbit()
        );
        // t.equal(agents.length, 1);
        // t.equal(encodeHashToBase64(agents[0]), encodeHashToBase64(bob_agent_key));
        // console.log("agents", agents);
      } catch (e) {
        // console.log("Testing error: ", e);

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

