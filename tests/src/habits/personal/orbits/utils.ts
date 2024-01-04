import { EntryRecord } from "@holochain-open-dev/utils";
import { Orbit, Sphere } from "../../../../../app/src/graphql/generated";

export async function setupSphere(callZomeAlice) {
  const createSphereResponse = await callZomeAlice(
    "personal",
    "create_sphere",
    aSphere()
  );

  return new EntryRecord<Sphere>(createSphereResponse).entryHash;
}

export async function createOrbitChildren(callZome: Function, sphereHash: string, parentHash: string, number: number): Promise<EntryRecord<Orbit>[]> {
  const createdOrbits: EntryRecord<Orbit>[] = [];
  for (let i = 0; i < number; i++) {
    const createOrbitResponse = await callZome(
      "personal",
      "create_my_orbit",
      anOrbit({ name: `Child of ${parentHash} ${i + 1}`, parentHash: parentHash, sphereHash })
    );
    if (createOrbitResponse) {
      const orbit = new EntryRecord<Orbit>(createOrbitResponse);
      createdOrbits.push(orbit);
    } else {
      throw new Error(`Failed to create orbit ${i + 1}`);
    }
  }
  return createdOrbits;
}

export const aSphere = (overrides?) => {
  return {
      id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : '14830037-c822-4498-8463-d3354c2fce66',
      metadata: overrides && overrides.hasOwnProperty('metadata') ? overrides.metadata! : {
        description: "This is a nice sphere",
        hashtag: 'TheBestSphere',
      },
      name: overrides && overrides.hasOwnProperty('name') ? overrides.name! : 'est',
  };
}

export const anOrbit = (overrides?) => {
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
