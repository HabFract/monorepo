import Mutation from "../mutations";
import Query from "../queries";
import { ResolverOptions } from "../types.js";

export default async (options: ResolverOptions) => {
  const { conductorUri, dnaConfig } = options;

  return {
    Query: Query(dnaConfig, conductorUri),
    Mutation: Mutation(dnaConfig, conductorUri),
  };
};
