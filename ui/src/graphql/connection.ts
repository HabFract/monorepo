/**
 * Connection wrapper for Holochain DNA method calls
 *
 * :WARNING:
 *
 * This layer is currently unsuitable for mixing with DNAs that use dna-local identifier formats, and
 * will cause encoding errors if 2-element lists of identifiers are passed.
 *
 * Such tuples are interpreted as [`DnaHash`, `AnyDhtHash`] pairs by the GraphQL <-> Holochain
 * serialisation layer and transformed into compound IDs at I/O time. So, this adapter should
 * *only* be used to wrap DNAs explicitly developed with multi-DNA references in mind.
 *

 */
import { DNAIdMappings } from "./types";
import {
  ADMIN_WS_PORT,
  APP_WS_PORT,
  HAPP_DNA_NAME,
  HAPP_ID,
  HAPP_ZOME_NAME_PERSONAL_HABITS,
  NODE_ENV,
} from "../constants";
import {
  AdminWebsocket,
  AppAuthenticationToken,
  AppSignalCb,
  AppWebsocket,
  CellId,
  CellInfo,
  HoloHash,
} from "@holochain/client";
import deepForEach from "deep-for-each";
import { format, parse } from "fecha";
import isObject from "is-object";
import { Base64 } from "js-base64";
import { debounce } from "../components/vis/helpers";

type RecordId = [HoloHash, HoloHash];

export function getCellId(cellInfo: CellInfo): CellId {
  if ("provisioned" in cellInfo) {
    return cellInfo.provisioned.cell_id;
  }
  if ("cloned" in cellInfo) {
    return cellInfo.cloned.cell_id;
  }
  throw new Error("CellInfo does not contain a CellId.");
}

// ----------------------------------------------------------------------------------------------------------------------
// Connection persistence and multi-conductor / multi-agent handling
// ----------------------------------------------------------------------------------------------------------------------

// :NOTE: when calling AppWebsocket.connect for the Launcher Context
// it just expects an empty string for the socketURI. Other environments require it.
const DEFAULT_CONNECTION_URI =
  (`ws://localhost:${APP_WS_PORT}` as string) || "";
const HOLOCHAIN_APP_ID = (HAPP_ID as string) || "";

const CONNECTION_CACHE: { [i: string]: any } = {};
let connectionPromise: Promise<any> | null = null;

export async function autoConnect(conductorUri?: string) {
  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = (async () => {
    console.log(`Environment: `, NODE_ENV);
    const dev = NODE_ENV == "dev";
    let dnaConfig, appWs;
    if (!conductorUri) {
      conductorUri = dev ? DEFAULT_CONNECTION_URI : `ws://localhost:NONE`;
    }
    if (!dev) {
      appWs = await openConnection();
      dnaConfig = await sniffHolochainAppCells(appWs);
    } else {
      const adminWs = await AdminWebsocket.connect({
        url: new URL(`ws://localhost:${ADMIN_WS_PORT}`),
      } as any);
      const token = await adminWs.issueAppAuthenticationToken({
        installed_app_id: HAPP_ID,
      });
      appWs = await openConnection(token.token);
      dnaConfig = await sniffHolochainAppCells(appWs);
      await adminWs.authorizeSigningCredentials(
        dnaConfig[HAPP_DNA_NAME]!.cell_id!
      );
    }
    CONNECTION_CACHE[HAPP_ID] = { client: appWs, dnaConfig, conductorUri };
    console.log("Holochain connection established");
    return CONNECTION_CACHE[HAPP_ID];
  })();

  return connectionPromise;
}

export const openConnection = (token?: AppAuthenticationToken) => {
  return AppWebsocket.connect(
    NODE_ENV == "dev"
      ? { token, url: DEFAULT_CONNECTION_URI }
      : (undefined as any)
  ).then((client) => {
    // console.log(`Holochain connection to ${HAPP_ID} OK:`, client);
    return client;
  });
};

export const getConnection = debounce(autoConnect, 300);

/**
 * Introspect an active Holochain connection's app cells to determine cell IDs
 * for mapping to the schema resolvers.
 */
export async function sniffHolochainAppCells(
  conn: AppWebsocket,
  appID?: string
) {
  const appInfo = await conn.appInfo();
  if (!appInfo) {
    throw new Error(
      `appInfo call failed for Holochain app '${
        appID || HOLOCHAIN_APP_ID
      }' - ensure the name is correct and that the app installation has succeeded`
    );
  }
  const dnas: object = appInfo["cell_info"];

  const dnaMappings = {
    [HAPP_DNA_NAME]: dnas[HAPP_DNA_NAME][0]["provisioned"],
  };
  // console.info('Connecting to detected Holochain cells:', dnaMappings)

  return dnaMappings;
}

// ----------------------------------------------------------------------------------------------------------------------
// Holochain / GraphQL type translation layer
// ----------------------------------------------------------------------------------------------------------------------

// @see https://crates.io/crates/holo_hash
const HOLOCHAIN_IDENTIFIER_LEN = 39;
// @see holo_hash::hash_type::primitive
const HOLOHASH_PREFIX_DNA = [0x84, 0x2d, 0x24]; // uhC0k
const HOLOHASH_PREFIX_ENTRY = [0x84, 0x21, 0x24]; // uhCEk
const HOLOHASH_PREFIX_HEADER = [0x84, 0x29, 0x24]; // uhCkk
const HOLOHASH_PREFIX_AGENT = [0x84, 0x20, 0x24]; // uhCAk

const serializedHashMatchRegex = /^[A-Za-z0-9_+\-/]{53}={0,2}$/;
const idMatchRegex = /^[A-Za-z0-9_+\-/]{53}={0,2}:[A-Za-z0-9_+\-/]{53}={0,2}$/;
const stringIdRegex = /^\w+?:[A-Za-z0-9_+\-/]{53}={0,2}$/;

// @see https://github.com/holochain-open-dev/core-types/blob/main/src/utils.ts
export function deserializeHash(hash: string): Uint8Array {
  return Base64.toUint8Array(hash.slice(1));
}

function deserializeId(field: string): RecordId {
  const matches = field.split(":");
  return [
    Buffer.from(deserializeHash(matches[1])),
    Buffer.from(deserializeHash(matches[0])),
  ];
}

function deserializeStringId(field: string): [Buffer, string] {
  const matches = field.split(":");
  return [Buffer.from(deserializeHash(matches[1])), matches[0]];
}

// @see https://github.com/holochain-open-dev/core-types/blob/main/src/utils.ts
export function serializeHash(hash: Uint8Array): string {
  return `u${Base64.fromUint8Array(hash, true)}`;
}

function seralizeId(id: RecordId): string {
  return `${serializeHash(id[1])}:${serializeHash(id[0])}`;
}

function seralizeStringId(id: [Buffer, string]): string {
  return `${id[1]}:${serializeHash(id[0])}`;
}

// Construct appropriate IDs for records in associated DNAs by substituting
// the CellId portion of the ID with that of an appropriate destination record
export function remapCellId(originalId, newCellId) {
  const [origId, _origCell] = originalId.split(":");
  return `${origId}:${newCellId.split(":")[1]}`;
}

const LONG_DATETIME_FORMAT = "YYYY-MM-DDTHH:mm:ss.SSSZ";
const SHORT_DATETIME_FORMAT = "YYYY-MM-DDTHH:mm:ssZ";
const isoDateRegex =
  /^\d{4}-\d\d-\d\d(T\d\d:\d\d:\d\d(\.\d\d\d)?)?([+-]\d\d:\d\d)?$/;

/**
 * Decode raw data input coming from Holochain API websocket.
 *
 * Mutates in place- we have no need for the non-normalised primitive format and this saves memory.
 */
const decodeFields = (result: any): void => {
  deepForEach(result, (value, prop, subject) => {
    // HeaderHash
    if (
      (value instanceof Buffer || value instanceof Uint8Array) &&
      value.length === HOLOCHAIN_IDENTIFIER_LEN &&
      checkLeadingBytes(value, HOLOHASH_PREFIX_HEADER)
    ) {
      subject[prop] = serializeHash(value as unknown as Uint8Array);
    }

    // RecordId | StringId (Agent, for now)
    if (
      Array.isArray(value) &&
      value.length == 2 &&
      (value[0] instanceof Buffer || value[0] instanceof Uint8Array) &&
      value[0].length === HOLOCHAIN_IDENTIFIER_LEN &&
      checkLeadingBytes(value[0], HOLOHASH_PREFIX_DNA)
    ) {
      // Match 2-element arrays of Buffer objects as IDs.
      // Since we check the hash prefixes, this should make it safe to mix with fields which reference arrays of plain EntryHash / HeaderHash data.
      if (
        (value[1] instanceof Buffer || value[1] instanceof Uint8Array) &&
        value[1].length === HOLOCHAIN_IDENTIFIER_LEN &&
        (checkLeadingBytes(value[1], HOLOHASH_PREFIX_ENTRY) ||
          checkLeadingBytes(value[1], HOLOHASH_PREFIX_HEADER) ||
          checkLeadingBytes(value[1], HOLOHASH_PREFIX_AGENT))
      ) {
        subject[prop] = seralizeId(value as RecordId);
        // Match 2-element pairs of Buffer/String as a "DNA-scoped identifier" (eg. UnitId)
        // :TODO: This one probably isn't safe for regular ID field mixing.
        //        Custom serde de/serializer would make bind this handling to the appropriate fields without duck-typing issues.
      } else {
        subject[prop] = seralizeStringId(value as [Buffer, string]);
      }
    }

    // recursively check for Date strings and convert to JS date objects upon receiving
    if (value && value.match && value.match(isoDateRegex)) {
      subject[prop] = parse(value, LONG_DATETIME_FORMAT);
      if (subject[prop] === null) {
        subject[prop] = parse(value, SHORT_DATETIME_FORMAT);
      }
    }
  });
};

function checkLeadingBytes(ofVar, against) {
  return (
    ofVar[0] === against[0] &&
    ofVar[1] === against[1] &&
    ofVar[2] === against[2]
  );
}

/**
 * Encode application runtime data into serialisable format for transmitting to API websocket.
 *
 * Clones data in order to keep input data pristine.
 */
const encodeFields = (args: any): any => {
  if (!args) return args;
  let res = args;

  // encode dates as ISO8601 DateTime strings
  if (args instanceof Date) {
    return format(args, LONG_DATETIME_FORMAT);
  }

  // deserialise any identifiers back to their binary format
  else if (args.match && args.match(serializedHashMatchRegex)) {
    return deserializeHash(args);
  } else if (args.match && args.match(idMatchRegex)) {
    return deserializeId(args);
  } else if (args.match && args.match(stringIdRegex)) {
    return deserializeStringId(args);
  }

  // recurse into child fields
  else if (Array.isArray(args)) {
    res = [];
    args.forEach((value, key) => {
      res[key] = encodeFields(value);
    });
  } else if (isObject(args)) {
    res = {};
    for (const key in args) {
      res[key] = encodeFields(args[key]);
    }
  }

  return res;
};

// ----------------------------------------------------------------------------------------------------------------------
// Holochain cell API method binding API
// ----------------------------------------------------------------------------------------------------------------------

// explicit type-loss at the boundary
export type BoundZomeFn<InputType, OutputType> = (
  args: InputType
) => OutputType;

/**
 * Higher-order function to generate async functions for calling zome RPC methods
 */
const zomeFunction =
  <InputType, OutputType>(
    socketURI: string,
    cell_id: CellId,
    zome_name: string,
    fn_name: string,
    skipEncodeDecode?: boolean
  ): BoundZomeFn<InputType, Promise<OutputType>> =>
  async (args): Promise<OutputType> => {
    const conn = await getConnection();
    const res = await (conn as any).client.callZome(
      {
        cap_secret: null,
        cell_id,
        zome_name,
        fn_name,
        provenance: cell_id[1],
        payload: skipEncodeDecode ? args : encodeFields(args),
      },
      60000
    );
    // .then((response) => {
    //   console.log("Zome response:", response)
    // }).catch((e) => {
    //   console.error(e)
    // })

    if (!skipEncodeDecode) decodeFields(res);
    return res;
  };

/**
 * External API for accessing zome methods, passing them through an optional intermediary DNA ID mapping
 *
 * @param mappings  DNAIdMappings to use for this collaboration space.
 *                  `instance` must be present in the mapping, and the mapped CellId will be used instead of `instance` itself.
 * @param socketURI If provided, connects to the Holochain conductor on a different URI.
 *
 * @return bound async zome function which can be called directly
 */
export const mapZomeFn = <InputType, OutputType>(
  mappings: DNAIdMappings,
  socketURI: string,
  instance: string,
  zome: string,
  fn: string,
  skipEncodeDecode?: boolean
) => {
  return zomeFunction<InputType, OutputType>(
    socketURI,
    mappings && mappings[instance]["cell_id"],
    zome,
    fn,
    skipEncodeDecode
  );
};
