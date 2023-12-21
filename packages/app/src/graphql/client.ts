import bindSchema, { autoConnect, APIOptions, DNAIdMappings } from '.'
import { InMemoryCache, ApolloClient, from } from '@apollo/client'
import { onError } from '@apollo/client/link/error'
import { SchemaLink } from '@apollo/client/link/schema'

// Same as OpenConnectionOptions but for external client where dnaConfig may be autodetected
interface AutoConnectionOptions {
  dnaConfig?: DNAIdMappings
}

export type ClientOptions = APIOptions & AutoConnectionOptions

const errorLink = onError(
  ({ graphQLErrors, networkError, response, operation }) => {
    console.log('error response :>> ', response)

    if (graphQLErrors)
      graphQLErrors.forEach(({ message, locations, path }) =>
        console.log(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
        ),
      )
    if (networkError) console.log(`[Network error]: ${networkError}`)
  },
)

export async function initGraphQLClient(options: APIOptions) {
  const { dnaConfig, conductorUri } = await autoConnect()
  // const dnaConfig = {
  //   'habit_tracking': [new Uint8Array(Buffer.from('uhC0kokzPqryK7YbLP4V7xwDzvlBIes5HK6B7bOvHZnkdLigQf1PW')) as HoloHash,new Uint8Array(Buffer.from('uhCAkybfzxlEvEIf4WztnwTB5Ce0OeAwbXA0v22qXMnIiVKaPrDhG')) as AgentPubKey] as CellId
  // }
  const schema = await bindSchema({ dnaConfig, conductorUri }) // {conductorUri: `ws://localhost:${APP_WS_PORT}`} as APIOptions)

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: from([errorLink, new SchemaLink({ schema })]),
  })
}

// Unexpected error value: { type: "error", data: { type: "ribosome_error", data: "Wasm error while working with Ribosome: CallError(\"RuntimeError: unreachable\\n    at __rust_start_panic (<module>[104]:0x6650)\\n    at rust_panic (<module>[97]:0x6505)\\n    at std::panicking::rust_panic_with_hook::h623ac32ff431b114 (<module>[96]:0x64d5)\\n    at std::panicking::begin_panic_handler::{{closure}}::h4939ceabc7a11060 (<module>[77]:0x5bb7)\\n    at std::sys_common::backtrace::__rust_end_short_backtrace::h9f6add6df687a1bf (<module>[76]:0x5af6)\\n    at rust_begin_unwind (<module>[91]:0x6147)\\n    at core::panicking::panic_fmt::h5118e89563022e7e (<module>[188]:0xd950)\\n    at core::str::slice_error_fail::hc88da01b6001a2e3 (<module>[212]:0xf0f4)\\n    at hc_zome_profiles::handlers::prefix_path::hc55c1bed962199e4 (<module>[7154]:0x166a81)\\n    at hc_zome_profiles::handlers::create_profile::h75eaf0a3d144aea4 (<module>[7152]:0x16628c)\\n    at hc_zome_profiles::create_profile::h094e880826fb6cf8 (<module>[7046]:0x15ff7a)\\n    at create_profile (<module>[7312]:0x16cc88)\")" } }

async function connect(options: ClientOptions) {
  // autodetect `CellId`s if no explicit `dnaConfig` is provided
  if (!options.dnaConfig) {
    const { dnaConfig } = await autoConnect(options.conductorUri)
    options.dnaConfig = dnaConfig
  }

  return await initGraphQLClient(options)
}

export default connect
