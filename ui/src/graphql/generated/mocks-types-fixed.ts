import { AgentProfile, CreateResponsePayload, Node, Mutation, Orbit, Frequency, Scale, OrbitConnection, OrbitCreateParams, OrbitEdge, OrbitHierarchyQueryParams, OrbitMetaData, OrbitUpdateParams, PageInfo, Profile, ProfileFields, Query, QueryParamsLevel, Sphere, SphereConnection, SphereCreateParams, SphereEdge, SphereMetaData, SphereUpdateParams, TimeFrame, UserProfileCreateUpdateParams } from ".";

export const anAgentProfile = (overrides?: Partial<AgentProfile>): AgentProfile => {
    return {
        agentPubKey: overrides && overrides.hasOwnProperty('agentPubKey') ? overrides.agentPubKey! : 'error',
        profile: overrides && overrides.hasOwnProperty('profile') ? overrides.profile! : aProfile(),
    };
};

export const aCreateResponsePayload = (overrides?: Partial<CreateResponsePayload>): CreateResponsePayload => {
    return {
        actionHash: overrides && overrides.hasOwnProperty('actionHash') ? overrides.actionHash! : 'voluptatem',
        entryHash: overrides && overrides.hasOwnProperty('entryHash') ? overrides.entryHash! : 'et',
    };
};

export const aMutation = (overrides?: Partial<Mutation>): Mutation => {
    return {
        createOrbit: overrides && overrides.hasOwnProperty('createOrbit') ? overrides.createOrbit! : aCreateResponsePayload(),
        createProfile: overrides && overrides.hasOwnProperty('createProfile') ? overrides.createProfile! : anAgentProfile(),
        createSphere: overrides && overrides.hasOwnProperty('createSphere') ? overrides.createSphere! : aCreateResponsePayload(),
        deleteOrbit: overrides && overrides.hasOwnProperty('deleteOrbit') ? overrides.deleteOrbit! : '8c4ff9e4-b0db-409d-ba41-9a0a173bfe93',
        deleteSphere: overrides && overrides.hasOwnProperty('deleteSphere') ? overrides.deleteSphere! : 'd656573f-6b5f-48b1-b767-997e497a6673',
        updateOrbit: overrides && overrides.hasOwnProperty('updateOrbit') ? overrides.updateOrbit! : aCreateResponsePayload(),
        updateProfile: overrides && overrides.hasOwnProperty('updateProfile') ? overrides.updateProfile! : anAgentProfile(),
        updateSphere: overrides && overrides.hasOwnProperty('updateSphere') ? overrides.updateSphere! : aCreateResponsePayload(),
    };
};

export const aNode = (overrides?: Partial<Node & {eH: any, id: any}>): any => {
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

export const anOrbitCreateParams = (overrides?: Partial<OrbitCreateParams>): OrbitCreateParams => {
    return {
        description: overrides && overrides.hasOwnProperty('description') ? overrides.description! : 'et',
        endTime: overrides && overrides.hasOwnProperty('endTime') ? overrides.endTime! : 5.44,
        frequency: overrides && overrides.hasOwnProperty('frequency') ? overrides.frequency! : Frequency.Day,
        name: overrides && overrides.hasOwnProperty('name') ? overrides.name! : 'et',
        parentHash: overrides && overrides.hasOwnProperty('parentHash') ? overrides.parentHash! : 'rerum',
        scale: overrides && overrides.hasOwnProperty('scale') ? overrides.scale! : Scale.Astro,
        sphereHash: overrides && overrides.hasOwnProperty('sphereHash') ? overrides.sphereHash! : 'dicta',
        startTime: overrides && overrides.hasOwnProperty('startTime') ? overrides.startTime! : 1.27,
    };
};

export const anOrbitEdge = (overrides?: Partial<OrbitEdge>): OrbitEdge => {
    return {
        cursor: overrides && overrides.hasOwnProperty('cursor') ? overrides.cursor! : 'placeat',
        node: overrides && overrides.hasOwnProperty('node') ? overrides.node! : anOrbit(),
    };
};

export const anOrbitHierarchyQueryParams = (overrides?: Partial<OrbitHierarchyQueryParams>): OrbitHierarchyQueryParams => {
    return {
        levelQuery: overrides && overrides.hasOwnProperty('levelQuery') ? overrides.levelQuery! : aQueryParamsLevel(),
        orbitEntryHashB64: overrides && overrides.hasOwnProperty('orbitEntryHashB64') ? overrides.orbitEntryHashB64! : 'aut',
    };
};

export const anOrbitMetaData = (overrides?: Partial<OrbitMetaData>): OrbitMetaData => {
    return {
        description: overrides && overrides.hasOwnProperty('description') ? overrides.description! : 'mollitia',
        timeframe: overrides && overrides.hasOwnProperty('timeframe') ? overrides.timeframe! : aTimeFrame(),
    };
};

export const anOrbitUpdateParams = (overrides?: Partial<OrbitUpdateParams>): OrbitUpdateParams => {
    return {
        description: overrides && overrides.hasOwnProperty('description') ? overrides.description! : 'hic',
        endTime: overrides && overrides.hasOwnProperty('endTime') ? overrides.endTime! : 9.75,
        frequency: overrides && overrides.hasOwnProperty('frequency') ? overrides.frequency! : Frequency.Day,
        id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : '5e9990e6-4406-4794-b94d-f5a055814d5c',
        name: overrides && overrides.hasOwnProperty('name') ? overrides.name! : 'ab',
        parentHash: overrides && overrides.hasOwnProperty('parentHash') ? overrides.parentHash! : 'minima',
        scale: overrides && overrides.hasOwnProperty('scale') ? overrides.scale! : Scale.Astro,
        sphereHash: overrides && overrides.hasOwnProperty('sphereHash') ? overrides.sphereHash! : 'omnis',
        startTime: overrides && overrides.hasOwnProperty('startTime') ? overrides.startTime! : 9.19,
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
        getLowestSphereHierarchyLevel: overrides && overrides.hasOwnProperty('getLowestSphereHierarchyLevel') ? overrides.getLowestSphereHierarchyLevel! : 7407,
    };
};

export const aQueryParamsLevel = (overrides?: Partial<QueryParamsLevel>): QueryParamsLevel => {
    return {
        orbitLevel: overrides && overrides.hasOwnProperty('orbitLevel') ? overrides.orbitLevel! : 9.99,
        sphereHashB64: overrides && overrides.hasOwnProperty('sphereHashB64') ? overrides.sphereHashB64! : 'cum',
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

export const aSphereCreateParams = (overrides?: Partial<SphereCreateParams>): SphereCreateParams => {
    return {
        description: overrides && overrides.hasOwnProperty('description') ? overrides.description! : 'nihil',
        hashtag: overrides && overrides.hasOwnProperty('hashtag') ? overrides.hashtag! : 'perspiciatis',
        image: overrides && overrides.hasOwnProperty('image') ? overrides.image! : 'officiis',
        name: overrides && overrides.hasOwnProperty('name') ? overrides.name! : 'perspiciatis',
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
        image: overrides && overrides.hasOwnProperty('image') ? overrides.image! : 'esse',
    };
};

export const aSphereUpdateParams = (overrides?: Partial<SphereUpdateParams>): SphereUpdateParams => {
    return {
        description: overrides && overrides.hasOwnProperty('description') ? overrides.description! : 'quod',
        hashtag: overrides && overrides.hasOwnProperty('hashtag') ? overrides.hashtag! : 'aut',
        id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : 'f8706fe3-f5f1-4881-888f-50f3cf5a30a7',
        image: overrides && overrides.hasOwnProperty('image') ? overrides.image! : 'voluptates',
        name: overrides && overrides.hasOwnProperty('name') ? overrides.name! : 'enim',
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
