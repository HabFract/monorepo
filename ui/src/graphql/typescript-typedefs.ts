const { printSchemaWithDirectives } = require("@graphql-toolkit/common");

const print = (schema) => `
  import gql from "graphql-tag";
  export const typeDefs = gql\`${schema}\`;
`;

module.exports = {
  plugin: (schema) => print(printSchemaWithDirectives(schema)),
};