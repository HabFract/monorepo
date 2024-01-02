
export const anAgentProfile = (overrides?: Partial<AgentProfile>): AgentProfile => {
    return {
        agentPubKey: overrides && overrides.hasOwnProperty('agentPubKey') ? overrides.agentPubKey! : 'error',
        profile: overrides && overrides.hasOwnProperty('profile') ? overrides.profile! : aProfile(),
    };
};

export const aMutation = (overrides?: Partial<Mutation>): Mutation => {
    return {
        createOrbit: overrides && overrides.hasOwnProperty('createOrbit') ? overrides.createOrbit! : anOrbitCreateResponse(),
        createProfile: overrides && overrides.hasOwnProperty('createProfile') ? overrides.createProfile! : anAgentProfile(),
        createSphere: overrides && overrides.hasOwnProperty('createSphere') ? overrides.createSphere! : aSphereCreateResponse(),
        updateOrbit: overrides && overrides.hasOwnProperty('updateOrbit') ? overrides.updateOrbit! : anOrbit(),
        updateProfile: overrides && overrides.hasOwnProperty('updateProfile') ? overrides.updateProfile! : anAgentProfile(),
        updateSphere: overrides && overrides.hasOwnProperty('updateSphere') ? overrides.updateSphere! : aSphere(),
    };
};

export const aNode = (overrides?: Partial<Node>): Node => {
    return {
        eH: overrides && overrides.hasOwnProperty('eH') ? overrides.eH! : 'iure',
        id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : '95bb2f34-6c86-495f-bfdc-f25b025cdba5',
    };
};

export const anOrbit = (overrides?: Partial<Orbit>): Orbit => {
    return {
        eH: overrides && overrides.hasOwnProperty('eH') ? overrides.eH! : 'exercitationem',
        frequency: overrides && overrides.hasOwnProperty('frequency') ? overrides.frequency! : Frequency.Day,
        id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : 'cb6d9b13-cc5b-4d03-ab32-b7e56988c4e1',
        metadata: overrides && overrides.hasOwnProperty('metadata') ? overrides.metadata! : anOrbitMetaData(),
        name: overrides && overrides.hasOwnProperty('name') ? overrides.name! : 'tempora',
        parentHash: overrides && overrides.hasOwnProperty('parentHash') ? overrides.parentHash! : 'error',
        scale: overrides && overrides.hasOwnProperty('scale') ? overrides.scale! : Scale.Astro,
        sphereHash: overrides && overrides.hasOwnProperty('sphereHash') ? overrides.sphereHash! : 'ducimus',
    };
};

export const anOrbitConnection = (overrides?: Partial<OrbitConnection>): OrbitConnection => {
    return {
        edges: overrides && overrides.hasOwnProperty('edges') ? overrides.edges! : [anOrbitEdge()],
        pageInfo: overrides && overrides.hasOwnProperty('pageInfo') ? overrides.pageInfo! : aPageInfo(),
    };
};

export const anOrbitCreateResponse = (overrides?: Partial<OrbitCreateResponse>): OrbitCreateResponse => {
    return {
        payload: overrides && overrides.hasOwnProperty('payload') ? overrides.payload! : aResponsePayload(),
    };
};

export const anOrbitCreateUpdateParams = (overrides?: Partial<OrbitCreateUpdateParams>): OrbitCreateUpdateParams => {
    return {
        description: overrides && overrides.hasOwnProperty('description') ? overrides.description! : 'tenetur',
        endTime: overrides && overrides.hasOwnProperty('endTime') ? overrides.endTime! : 7.66,
        frequency: overrides && overrides.hasOwnProperty('frequency') ? overrides.frequency! : Frequency.Day,
        name: overrides && overrides.hasOwnProperty('name') ? overrides.name! : 'non',
        parentHash: overrides && overrides.hasOwnProperty('parentHash') ? overrides.parentHash! : 'voluptatibus',
        scale: overrides && overrides.hasOwnProperty('scale') ? overrides.scale! : Scale.Astro,
        sphereHash: overrides && overrides.hasOwnProperty('sphereHash') ? overrides.sphereHash! : 'fugiat',
        startTime: overrides && overrides.hasOwnProperty('startTime') ? overrides.startTime! : 5.37,
    };
};

export const anOrbitEdge = (overrides?: Partial<OrbitEdge>): OrbitEdge => {
    return {
        cursor: overrides && overrides.hasOwnProperty('cursor') ? overrides.cursor! : 'placeat',
        node: overrides && overrides.hasOwnProperty('node') ? overrides.node! : anOrbit(),
    };
};

export const anOrbitMetaData = (overrides?: Partial<OrbitMetaData>): OrbitMetaData => {
    return {
        description: overrides && overrides.hasOwnProperty('description') ? overrides.description! : 'mollitia',
        timeframe: overrides && overrides.hasOwnProperty('timeframe') ? overrides.timeframe! : aTimeFrame(),
    };
};

export const aPageInfo = (overrides?: Partial<PageInfo>): PageInfo => {
    return {
        endCursor: overrides && overrides.hasOwnProperty('endCursor') ? overrides.endCursor! : 'id',
        hasNextPage: overrides && overrides.hasOwnProperty('hasNextPage') ? overrides.hasNextPage! : true,
        hasPreviousPage: overrides && overrides.hasOwnProperty('hasPreviousPage') ? overrides.hasPreviousPage! : false,
        startCursor: overrides && overrides.hasOwnProperty('startCursor') ? overrides.startCursor! : 'eum',
    };
};

export const aProfile = (overrides?: Partial<Profile>): Profile => {
    return {
        fields: overrides && overrides.hasOwnProperty('fields') ? overrides.fields! : aProfileFields(),
        nickname: overrides && overrides.hasOwnProperty('nickname') ? overrides.nickname! : 'sunt',
    };
};

export const aProfileFields = (overrides?: Partial<ProfileFields>): ProfileFields => {
    return {
        avatar: overrides && overrides.hasOwnProperty('avatar') ? overrides.avatar! : 'quo',
        isPublic: overrides && overrides.hasOwnProperty('isPublic') ? overrides.isPublic! : 'autem',
        location: overrides && overrides.hasOwnProperty('location') ? overrides.location! : 'reprehenderit',
    };
};

export const aQuery = (overrides?: Partial<Query>): Query => {
    return {
        getOrbitHierarchy: overrides && overrides.hasOwnProperty('getOrbitHierarchy') ? overrides.getOrbitHierarchy! : 'sint',
        me: overrides && overrides.hasOwnProperty('me') ? overrides.me! : anAgentProfile(),
        orbit: overrides && overrides.hasOwnProperty('orbit') ? overrides.orbit! : anOrbit(),
        orbits: overrides && overrides.hasOwnProperty('orbits') ? overrides.orbits! : anOrbitConnection(),
        sphere: overrides && overrides.hasOwnProperty('sphere') ? overrides.sphere! : aSphere(),
        spheres: overrides && overrides.hasOwnProperty('spheres') ? overrides.spheres! : aSphereConnection(),
    };
};

export const aResponsePayload = (overrides?: Partial<ResponsePayload>): ResponsePayload => {
    return {
        actionHash: overrides && overrides.hasOwnProperty('actionHash') ? overrides.actionHash! : 'aut',
        entryHash: overrides && overrides.hasOwnProperty('entryHash') ? overrides.entryHash! : 'similique',
    };
};

export const aSphere = (overrides?: Partial<Sphere>): Sphere => {
    return {
        eH: overrides && overrides.hasOwnProperty('eH') ? overrides.eH! : 'libero',
        id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : '14830037-c822-4498-8463-d3354c2fce66',
        metadata: overrides && overrides.hasOwnProperty('metadata') ? overrides.metadata! : aSphereMetaData(),
        name: overrides && overrides.hasOwnProperty('name') ? overrides.name! : 'est',
    };
};

export const aSphereConnection = (overrides?: Partial<SphereConnection>): SphereConnection => {
    return {
        edges: overrides && overrides.hasOwnProperty('edges') ? overrides.edges! : [aSphereEdge()],
        pageInfo: overrides && overrides.hasOwnProperty('pageInfo') ? overrides.pageInfo! : aPageInfo(),
    };
};

export const aSphereCreateResponse = (overrides?: Partial<SphereCreateResponse>): SphereCreateResponse => {
    return {
        payload: overrides && overrides.hasOwnProperty('payload') ? overrides.payload! : aResponsePayload(),
    };
};

export const aSphereCreateUpdateParams = (overrides?: Partial<SphereCreateUpdateParams>): SphereCreateUpdateParams => {
    return {
        description: overrides && overrides.hasOwnProperty('description') ? overrides.description! : 'reiciendis',
        hashtag: overrides && overrides.hasOwnProperty('hashtag') ? overrides.hashtag! : 'quibusdam',
        name: overrides && overrides.hasOwnProperty('name') ? overrides.name! : 'voluptas',
    };
};

export const aSphereEdge = (overrides?: Partial<SphereEdge>): SphereEdge => {
    return {
        cursor: overrides && overrides.hasOwnProperty('cursor') ? overrides.cursor! : 'laborum',
        node: overrides && overrides.hasOwnProperty('node') ? overrides.node! : aSphere(),
    };
};

export const aSphereMetaData = (overrides?: Partial<SphereMetaData>): SphereMetaData => {
    return {
        description: overrides && overrides.hasOwnProperty('description') ? overrides.description! : 'placeat',
        hashtag: overrides && overrides.hasOwnProperty('hashtag') ? overrides.hashtag! : 'facilis',
    };
};

export const aTimeFrame = (overrides?: Partial<TimeFrame>): TimeFrame => {
    return {
        endTime: overrides && overrides.hasOwnProperty('endTime') ? overrides.endTime! : 6.44,
        startTime: overrides && overrides.hasOwnProperty('startTime') ? overrides.startTime! : 0.44,
    };
};

export const aUserProfileCreateUpdateParams = (overrides?: Partial<UserProfileCreateUpdateParams>): UserProfileCreateUpdateParams => {
    return {
        avatar: overrides && overrides.hasOwnProperty('avatar') ? overrides.avatar! : 'molestias',
        isPublic: overrides && overrides.hasOwnProperty('isPublic') ? overrides.isPublic! : 'quae',
        location: overrides && overrides.hasOwnProperty('location') ? overrides.location! : 'illo',
        nickname: overrides && overrides.hasOwnProperty('nickname') ? overrides.nickname! : 'quam',
    };
};
