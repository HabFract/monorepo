import { NODE_ENV } from "./../constants";
import bindSchema, { autoConnect, APIOptions, DNAIdMappings } from ".";
import { InMemoryCache, ApolloClient, from, makeVar } from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { SchemaLink } from "@apollo/client/link/schema";
import { createEdges, extractEdges } from "./utils";

// Same as OpenConnectionOptions but for external client where dnaConfig may be autodetected
interface AutoConnectionOptions {
  dnaConfig?: DNAIdMappings;
}

export type ClientOptions = APIOptions & AutoConnectionOptions;

const errorLink = onError(({ graphQLErrors, networkError, response }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) => {
      const decodedErrors = message.match(/Deserialize\(\[(.*?)\]\)/);
      const error = decodedErrors ? [1] : "";
      console.log(
        `[GraphQL error]: DeserializedBuffer: ${JSON.stringify(error ? JSON.parse("[" + error + "]") : "{}", null, 2)}, Message: ${message}, Location: ${locations}, Path: ${path}`,
      );
    });
  if (networkError) console.log(`[Network error]: ${networkError}`);
});
export const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        orbits: {
          keyArgs: false, // Indicates that all arguments for this field should be considered when caching
          merge(existing, incoming) {
            incoming = extractEdges(incoming);
            // Ensure incoming is an array
            if (!Array.isArray(incoming)) {
              throw new Error(`Incoming data is not iterable: ${incoming}`);
            }
            const merged =
              existing && existing?.length ? existing.slice(0) : [];
            // Assuming 'id' is the unique identifier for orbits
            const existingIds = new Set(merged.map((orbit) => orbit.id));
            for (const orbit of incoming) {
              if (!existingIds.has(orbit.id)) {
                merged.push(orbit);
              }
            }
            return createEdges(merged);
          },
        },
        spheres: {
          keyArgs: false, // Indicates that all arguments for this field should be considered when caching
          merge(existing, incoming) {
            incoming = extractEdges(incoming);
            // Ensure incoming is an array
            if (!Array.isArray(incoming)) {
              throw new Error(`Incoming data is not iterable: ${incoming}`);
            }
            const merged =
              existing && existing?.length ? existing.slice(0) : [];
            // Assuming 'id' is the unique identifier for spheres
            const existingIds = new Set(merged.map((sphere) => sphere.id));
            for (const sphere of incoming) {
              if (!existingIds.has(sphere.id)) {
                merged.push(sphere);
              }
            }
            return createEdges(merged);
          },
        },
        orbit(_, { args, toReference }) {
          return toReference({
            __typename: "Orbit",
            id: args!.id,
          });
        },
        sphere(_, { args, toReference }) {
          return toReference({
            __typename: "Sphere",
            id: args!.id,
          });
        },
      },
    },
    Orbit: {
      keyFields: ["id"],
      fields: {
        // Define custom read functions for fields if necessary
      },
    },
    Sphere: {
      keyFields: ["id"],
      fields: {
        // Define custom read functions for fields if necessary
      },
    },
  },
});

export async function initGraphQLClient({ dnaConfig, conductorUri }) {
  const schema = await bindSchema({ dnaConfig, conductorUri }); // {conductorUri: `ws://localhost:${APP_WS_PORT}`} as APIOptions)

  return new ApolloClient({
    cache: cache,
    link: from([errorLink, new SchemaLink({ schema })]),
  });
}

const createClient = async () => {
  const connection = await autoConnect();
  const options = {
    ...connection,
    conductorUri: connection?.client?.client?.url!.href,
  };
  return await initGraphQLClient(options);
};

export const client = NODE_ENV !== "test" && createClient();
