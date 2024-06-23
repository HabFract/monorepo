export const extractEdges = <T>(withEdges: { edges: { node: T }[] }): T[] => {
  if (!withEdges?.edges || !withEdges.edges.length) {
    return []
  }
  return withEdges.edges.map(({ node }) => node)
}

export const createEdges = <T>(nodes: T[]): { edges: { node: T }[] } => {
  const edges = nodes.map((node) => ({ node, cursor: null }));
  return { edges };
};

export function serializeAsyncActions<T>(actions: Array<() => Promise<T>>) {
  let actionFiber = Promise.resolve({}) as Promise<T>;
  actionFiber = actions.reduce((chain: Promise<T>, curr) => chain.then(curr), actionFiber);
}