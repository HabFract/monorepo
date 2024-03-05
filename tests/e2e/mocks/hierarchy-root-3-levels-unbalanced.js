const { ORBITS_MOCKS } = require('./orbits');

  {
    request: {
      query: HIERARCHY_QUERY,
      variables: { rootId: 'root' },
    },
    result: {
      data: JSON.stringify({
        hierarchy: {
          id: 'root',
          children: [
            {
              id: 'child1',
              children: [
                {
                  id: 'grandchild1',
                  children: [
                    {
                      id: ORBITS_MOCKS[2].id,
                      children: [], // No children for this node
                    },
                    {
                      id: ORBITS_MOCKS[3].id,
                      children: [], // No children for this node
                    },
                  ],
                },
              ],
            },
            {
              id: 'child2',
              children: [
                // This child remains without children
              ],
            },
          ],
        },
      },
        }
      }),
    },
  },
];

module.exports = { HIERARCHY_ROOT_THREE_LEVELS_UNBALANCED_MOCKS };
