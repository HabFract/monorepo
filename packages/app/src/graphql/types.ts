/**
 * base types for GraphQL query layer
 */
import { AppSignalCb, CellId } from '@holochain/client'

// Configuration object to allow specifying custom conductor DNA IDs to bind to.
// Default is to use a DNA with the same ID as the mapping ID (ie. agent = "agent")
export interface DNAIdMappings {
  habit_tracking?: CellId
  // lobby?: CellId
}

export type { CellId }

// Options for resolver generator
export interface ResolverOptions {
  // Mapping of DNA identifiers to runtime `CellId`s to bind to.
  dnaConfig: DNAIdMappings

  // Custom Holochain conductor URI to use with this instance, to support connecting to multiple conductors.
  // If not specified, connects to the local conductor or the URI stored in `process.env.REACT_APP_HC_CONN_URL`.
  conductorUri: string

  // Callback to listen for signals from the Holochain app websocket, to support realtime event notifications.
  traceAppSignals?: AppSignalCb
}

// types that serialize for rust zome calls
// start of section
export interface ReadParams {
  address: AddressableIdentifier
}
export interface ById {
  id: AddressableIdentifier
}

export type AddressableIdentifier = string

// end of section

export type APIOptions = ResolverOptions

// helpers for resolvers to inject __typename parameter for union type disambiguation
// ...this might be unnecessarily present due to lack of familiarity with GraphQL?

type ObjDecorator<T> = (obj: T) => T
type Resolver<T> = (root, args) => Promise<T>

export function addTypename<T>(name: string): ObjDecorator<T> {
  return (obj) => {
    obj['__typename'] = name
    return obj
  }
}

export function injectTypename<T>(name: string, fn: Resolver<T>): Resolver<T> {
  return async (root, args): Promise<T> => {
    const data = await fn(root, args)
    data['__typename'] = name
    return data
  }
}
