import Mutation from "../mutations";
import Query from "../queries";
import { ResolverOptions } from "../types.js";

export default async (options: ResolverOptions) => {
  const { conductorUri, dnaConfig } = options;

  return {
    WinDateValue: {
      __resolveType(obj, context, info) {
        if (obj.single !== undefined) {
          return "SingleWin";
        }

        if (obj.multiple !== undefined) {
          return "MultipleWins";
        }

        return null; // Type could not be determined
      },
    },
    Query: Query(dnaConfig, conductorUri),
    Mutation: Mutation(dnaConfig, conductorUri),
  };
};
