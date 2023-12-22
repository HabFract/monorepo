
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: "src/graphql/schema.graphql",
  documents: "src/graphql/**/*.graphql",
  generates: {
    "src/graphql/generated/": {
      preset: "client",
      plugins: []
    },
    "src/graphql/graphql.schema.json": {
      plugins: ["introspection"]
    },
    "src/graphql/generated/mocks.ts": {
      plugins: ["graphql-codegen-typescript-mock-data"]
    },
  }
};

export default config;
