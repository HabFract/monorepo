export const aSphere = (overrides?) => {
  return {
      id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : '14830037-c822-4498-8463-d3354c2fce66',
      metadata: overrides && overrides.hasOwnProperty('metadata') ? overrides.metadata! : {
        description: "This is a nice sphere",
        hashtag: 'TheBestSphere',
      },
      name: overrides && overrides.hasOwnProperty('name') ? overrides.name! : 'est',
  };
}

export const anOrbit = (overrides?) => {
  return {
    frequency:
      overrides && overrides.hasOwnProperty("frequency")
        ? overrides.frequency!
        : "Day",
    metadata:
      overrides && overrides.hasOwnProperty("metadata")
        ? overrides.metadata!
        : {
            description: "This is a nice orbit",
            timeframe: {
              startTime: 1704020400000,
              endTime: undefined,
            },
          },
    name:
      overrides && overrides.hasOwnProperty("name")
        ? overrides.name!
        : "tempora",
    parentHash:
      overrides && overrides.hasOwnProperty("parentHash")
        ? overrides.parentHash!
        : undefined,
    scale:
      overrides && overrides.hasOwnProperty("scale")
        ? overrides.scale!
        : "Astro",
    sphereHash:
      overrides && overrides.hasOwnProperty("sphereHash")
        ? overrides.sphereHash!
        : "ducimus",
  };
};
