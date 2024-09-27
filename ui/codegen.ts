import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "src/graphql/schema.graphql",
  config: {
    sort: false,
  },
  documents: "src/graphql/**/*.graphql",
  generates: {
    "src/graphql/generated/index.ts": {
      presetConfig: {
        fragmentMasking: false,
      },
      plugins: [
        {
          add: {
            content:
              'import type { DocumentNode } from "graphql/language/ast";',
          },
        },
        "typescript",
        "typescript-operations",
        "typescript-react-apollo",
      ],
      config: {
        withComponent: false,
        withHOC: false,
        withHooks: true,
      },
    },
    "../design-system/src/generated-types.ts": {
      presetConfig: {
        fragmentMasking: false,
      },
      plugins: [
        {
          add: {
            content:
              'import type { DocumentNode } from "graphql/language/ast";',
          },
        },
        "typescript",
        "typescript-operations",
        "typescript-react-apollo",
      ],
      config: {
        withComponent: false,
        withHOC: false,
        withHooks: true,
      },
    },
    "src/graphql/graphql.schema.json": {
      plugins: ["introspection"],
    },
    "src/graphql/generated/mocks.ts": {
      plugins: ["graphql-codegen-typescript-mock-data"],
    },
    "src/graphql/generated/typeDefs.js": {
      plugins: ["./src/graphql/generated/codegen-typedefs.cjs"],
    },
  },
};

export default config;
