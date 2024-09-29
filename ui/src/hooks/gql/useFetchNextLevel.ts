import {
  ApolloClient,
  NormalizedCacheObject,
  useApolloClient,
} from "@apollo/client";
import {
  GetOrbitHierarchyDocument,
  OrbitHierarchyQueryParams,
} from "../../graphql/generated";
import { client } from "../../graphql/client";

const usePrefetchNextLevel = async (
  queryParams: OrbitHierarchyQueryParams,
  bypass: boolean = false
) => {
  const gql: ApolloClient<NormalizedCacheObject> =
    (await client) as ApolloClient<NormalizedCacheObject>;
  try {
    await gql.query({
      query: GetOrbitHierarchyDocument,
      variables: { params: { ...queryParams } },
    });
  } catch (error) {
    console.error("Error pre-fetching next level:", error);
  }
};

export default usePrefetchNextLevel;
