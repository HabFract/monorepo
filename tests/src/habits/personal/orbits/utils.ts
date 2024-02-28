import { EntryRecord } from "@holochain-open-dev/utils";
import { Orbit, Sphere } from "../../../../../app/src/graphql/generated";
import { encodeHashToBase64 } from "@holochain/client";

export async function setupSphere(callZomeAlice) {
  const createSphereResponse = await callZomeAlice(
    "personal",
    "create_my_sphere",
    aSphere()
  );

  return new EntryRecord<Sphere>(createSphereResponse).entryHash;
}
export async function setupSphereAsEntryRecord(callZomeAlice, opts) {
  const createSphereResponse = await callZomeAlice(
    "personal",
    "create_my_sphere",
    aSphere(opts)
  );

  return new EntryRecord<Sphere>(createSphereResponse);
}
export async function setupHierarchy3(callZomeAlice) {
    // Sphere
    const hash = await setupSphere(callZomeAlice);
    
    // Root - L0
    const createOrbitResponse = await callZomeAlice(
      "personal",
      "create_my_orbit",
      anOrbit({sphereHash: encodeHashToBase64(hash)})
    );
    const orbitHash = encodeHashToBase64(new EntryRecord<Orbit>(createOrbitResponse).entryHash);

    // L1
    // - 0
    const createOrbitResponse2 = await callZomeAlice(
      "personal",
      "create_my_orbit",
      anOrbit({name: "1.0", sphereHash: encodeHashToBase64(hash), parentHash: orbitHash})
    );
    const orbitHash2 = encodeHashToBase64(new EntryRecord<Orbit>(createOrbitResponse2).entryHash);
    // - 1
    const createOrbitResponse3 = await callZomeAlice(
      "personal",
      "create_my_orbit",
      anOrbit({ name: "1.1", sphereHash: encodeHashToBase64(hash), parentHash: orbitHash })
      );
    const orbitHash3 = encodeHashToBase64(new EntryRecord<Orbit>(createOrbitResponse3).entryHash);
    
    // L2
    const l20 = (await createOrbitChildren(callZomeAlice, encodeHashToBase64(hash), orbitHash2, 2)).map(eR => encodeHashToBase64(eR.entryHash))
    const l21 = (await createOrbitChildren(callZomeAlice, encodeHashToBase64(hash), orbitHash3, 2)).map(eR => encodeHashToBase64(eR.entryHash))

    return [hash, orbitHash, orbitHash2, orbitHash3, ...l20, ...l21]
}

export async function setupHierarchy4(callZomeAlice) {
  const [sphereHash, rootHash, c0, c1, c0_0, c0_1, c1_0, c1_1] = await setupHierarchy3(callZomeAlice);
    // L3
    const l30 = (await createOrbitChildren(callZomeAlice, sphereHash as string, c0_0 as string, 1)).map(eR => encodeHashToBase64(eR.entryHash))
    const l31 = (await createOrbitChildren(callZomeAlice, sphereHash as string, c0_1 as string, 1)).map(eR => encodeHashToBase64(eR.entryHash))
    const l32 = (await createOrbitChildren(callZomeAlice, sphereHash as string, c1_0 as string, 1)).map(eR => encodeHashToBase64(eR.entryHash))
    const l33 = (await createOrbitChildren(callZomeAlice, sphereHash as string, c1_1 as string, 1)).map(eR => encodeHashToBase64(eR.entryHash))

    return  [sphereHash, rootHash, c0, c1, c0_0, c0_1, c1_0, c1_1, ...l30,  ...l31,  ...l32,  ...l33 ]
}

export function serializeAsyncActions<T>(actions: Array<() => Promise<T>>) {
  let actionFiber = Promise.resolve({}) as Promise<T>;
  actionFiber = actions.reduce((chain: Promise<T>, curr) => chain.then(curr), actionFiber);
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
