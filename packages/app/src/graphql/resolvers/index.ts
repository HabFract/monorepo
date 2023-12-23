import Mutation from '../mutations'
import Query from '../queries'
import { ResolverOptions } from '../types.js'
import { DateTimeResolver as DateTime } from 'graphql-scalars'

export default async (options: ResolverOptions) => {
  const { conductorUri, dnaConfig } = options

  return {
    // scalars
    DateTime,

    // root schemas
    Query: Query(dnaConfig, conductorUri),
    Mutation: Mutation(dnaConfig, conductorUri),
  }
}
