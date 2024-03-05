const HIERARCHY_ROOT_THREE_LEVELS_UNBALANCED_MOCKS = [
  {
    request: {
      query: HIERARCHY_QUERY,
      variables: { rootId: 'root' },
    },
    result: {
      data: {
        hierarchy: {
          id: 'root',
          children: [
            {
              id: 'child1',
              children: [
                {
                  id: 'grandchild1',
                  children: [], // No children for this node
                },
              ],
            },
            {
              id: 'child2',
              children: [], // No children for this node
            },
          ],
        },
      },
    },
  },
];

export { HIERARCHY_ROOT_THREE_LEVELS_UNBALANCED_MOCKS };
