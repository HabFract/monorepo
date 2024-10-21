
export const aQuery = (overrides?: Partial<Query>): Query => {
    return {
        sphere: overrides && overrides.hasOwnProperty('sphere') ? overrides.sphere! : aSphere(),
        spheres: overrides && overrides.hasOwnProperty('spheres') ? overrides.spheres! : aSphereConnection(),
        orbit: overrides && overrides.hasOwnProperty('orbit') ? overrides.orbit! : anOrbit(),
        orbits: overrides && overrides.hasOwnProperty('orbits') ? overrides.orbits! : anOrbitConnection(),
        getOrbitHierarchy: overrides && overrides.hasOwnProperty('getOrbitHierarchy') ? overrides.getOrbitHierarchy! : 'sint',
        getLowestSphereHierarchyLevel: overrides && overrides.hasOwnProperty('getLowestSphereHierarchyLevel') ? overrides.getLowestSphereHierarchyLevel! : 7407,
        getWinRecordForOrbitForMonth: overrides && overrides.hasOwnProperty('getWinRecordForOrbitForMonth') ? overrides.getWinRecordForOrbitForMonth! : aWinRecord(),
        winRecords: overrides && overrides.hasOwnProperty('winRecords') ? overrides.winRecords! : [aWinRecord()],
        me: overrides && overrides.hasOwnProperty('me') ? overrides.me! : anAgentProfile(),
    };
};

export const aMutation = (overrides?: Partial<Mutation>): Mutation => {
    return {
        createSphere: overrides && overrides.hasOwnProperty('createSphere') ? overrides.createSphere! : aCreateSphereResponsePayload(),
        updateSphere: overrides && overrides.hasOwnProperty('updateSphere') ? overrides.updateSphere! : aCreateSphereResponsePayload(),
        deleteSphere: overrides && overrides.hasOwnProperty('deleteSphere') ? overrides.deleteSphere! : 'd656573f-6b5f-48b1-b767-997e497a6673',
        createOrbit: overrides && overrides.hasOwnProperty('createOrbit') ? overrides.createOrbit! : aCreateOrbitResponsePayload(),
        updateOrbit: overrides && overrides.hasOwnProperty('updateOrbit') ? overrides.updateOrbit! : anUpdateOrbitResponsePayload(),
        deleteOrbit: overrides && overrides.hasOwnProperty('deleteOrbit') ? overrides.deleteOrbit! : '8c4ff9e4-b0db-409d-ba41-9a0a173bfe93',
        createProfile: overrides && overrides.hasOwnProperty('createProfile') ? overrides.createProfile! : anAgentProfile(),
        updateProfile: overrides && overrides.hasOwnProperty('updateProfile') ? overrides.updateProfile! : anAgentProfile(),
        createWinRecord: overrides && overrides.hasOwnProperty('createWinRecord') ? overrides.createWinRecord! : aWinRecord(),
        updateWinRecord: overrides && overrides.hasOwnProperty('updateWinRecord') ? overrides.updateWinRecord! : aWinRecord(),
    };
};

export const aPageInfo = (overrides?: Partial<PageInfo>): PageInfo => {
    return {
        hasNextPage: overrides && overrides.hasOwnProperty('hasNextPage') ? overrides.hasNextPage! : true,
        hasPreviousPage: overrides && overrides.hasOwnProperty('hasPreviousPage') ? overrides.hasPreviousPage! : false,
        startCursor: overrides && overrides.hasOwnProperty('startCursor') ? overrides.startCursor! : 'eum',
        endCursor: overrides && overrides.hasOwnProperty('endCursor') ? overrides.endCursor! : 'id',
    };
};

export const aNode = (overrides?: Partial<Node>): Node => {
    return {
        id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : '95bb2f34-6c86-495f-bfdc-f25b025cdba5',
        eH: overrides && overrides.hasOwnProperty('eH') ? overrides.eH! : 'iure',
    };
};

export const aCreateSphereResponsePayload = (overrides?: Partial<CreateSphereResponsePayload>): CreateSphereResponsePayload => {
    return {
        id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : 'f1b184fb-8b2c-4441-9415-a6ca7686126d',
        actionHash: overrides && overrides.hasOwnProperty('actionHash') ? overrides.actionHash! : 'dicta',
        entryHash: overrides && overrides.hasOwnProperty('entryHash') ? overrides.entryHash! : 'dolores',
        eH: overrides && overrides.hasOwnProperty('eH') ? overrides.eH! : 'nemo',
        name: overrides && overrides.hasOwnProperty('name') ? overrides.name! : 'id',
        metadata: overrides && overrides.hasOwnProperty('metadata') ? overrides.metadata! : aSphereMetaData(),
    };
};

export const aCreateOrbitResponsePayload = (overrides?: Partial<CreateOrbitResponsePayload>): CreateOrbitResponsePayload => {
    return {
        id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : '5fad755e-8006-4c20-aba3-dd74eea04921',
        eH: overrides && overrides.hasOwnProperty('eH') ? overrides.eH! : 'magni',
        name: overrides && overrides.hasOwnProperty('name') ? overrides.name! : 'id',
        sphereHash: overrides && overrides.hasOwnProperty('sphereHash') ? overrides.sphereHash! : 'quod',
        parentHash: overrides && overrides.hasOwnProperty('parentHash') ? overrides.parentHash! : 'rerum',
        childHash: overrides && overrides.hasOwnProperty('childHash') ? overrides.childHash! : 'dicta',
        frequency: overrides && overrides.hasOwnProperty('frequency') ? overrides.frequency! : Frequency.OneShot,
        scale: overrides && overrides.hasOwnProperty('scale') ? overrides.scale! : Scale.Astro,
        metadata: overrides && overrides.hasOwnProperty('metadata') ? overrides.metadata! : anOrbitMetaData(),
    };
};

export const anUpdateOrbitResponsePayload = (overrides?: Partial<UpdateOrbitResponsePayload>): UpdateOrbitResponsePayload => {
    return {
        id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : 'c8259dc0-c7b7-4a63-a852-be01e9345c02',
        eH: overrides && overrides.hasOwnProperty('eH') ? overrides.eH! : 'dolorem',
        name: overrides && overrides.hasOwnProperty('name') ? overrides.name! : 'vitae',
        sphereHash: overrides && overrides.hasOwnProperty('sphereHash') ? overrides.sphereHash! : 'consequatur',
        parentHash: overrides && overrides.hasOwnProperty('parentHash') ? overrides.parentHash! : 'quos',
        childHash: overrides && overrides.hasOwnProperty('childHash') ? overrides.childHash! : 'aut',
        frequency: overrides && overrides.hasOwnProperty('frequency') ? overrides.frequency! : Frequency.OneShot,
        scale: overrides && overrides.hasOwnProperty('scale') ? overrides.scale! : Scale.Astro,
        metadata: overrides && overrides.hasOwnProperty('metadata') ? overrides.metadata! : anOrbitMetaData(),
    };
};

export const anAgentProfile = (overrides?: Partial<AgentProfile>): AgentProfile => {
    return {
        agentPubKey: overrides && overrides.hasOwnProperty('agentPubKey') ? overrides.agentPubKey! : 'error',
        profile: overrides && overrides.hasOwnProperty('profile') ? overrides.profile! : aProfile(),
    };
};

export const aProfile = (overrides?: Partial<Profile>): Profile => {
    return {
        nickname: overrides && overrides.hasOwnProperty('nickname') ? overrides.nickname! : 'sunt',
        fields: overrides && overrides.hasOwnProperty('fields') ? overrides.fields! : aProfileFields(),
    };
};

export const aProfileFields = (overrides?: Partial<ProfileFields>): ProfileFields => {
    return {
        location: overrides && overrides.hasOwnProperty('location') ? overrides.location! : 'reprehenderit',
        isPublic: overrides && overrides.hasOwnProperty('isPublic') ? overrides.isPublic! : 'autem',
        avatar: overrides && overrides.hasOwnProperty('avatar') ? overrides.avatar! : 'quo',
    };
};

export const aUserProfileCreateUpdateParams = (overrides?: Partial<UserProfileCreateUpdateParams>): UserProfileCreateUpdateParams => {
    return {
        nickname: overrides && overrides.hasOwnProperty('nickname') ? overrides.nickname! : 'quam',
        location: overrides && overrides.hasOwnProperty('location') ? overrides.location! : 'illo',
        isPublic: overrides && overrides.hasOwnProperty('isPublic') ? overrides.isPublic! : 'quae',
        avatar: overrides && overrides.hasOwnProperty('avatar') ? overrides.avatar! : 'molestias',
    };
};

export const aSphereConnection = (overrides?: Partial<SphereConnection>): SphereConnection => {
    return {
        edges: overrides && overrides.hasOwnProperty('edges') ? overrides.edges! : [aSphereEdge()],
        pageInfo: overrides && overrides.hasOwnProperty('pageInfo') ? overrides.pageInfo! : aPageInfo(),
    };
};

export const aSphereEdge = (overrides?: Partial<SphereEdge>): SphereEdge => {
    return {
        cursor: overrides && overrides.hasOwnProperty('cursor') ? overrides.cursor! : 'laborum',
        node: overrides && overrides.hasOwnProperty('node') ? overrides.node! : aSphere(),
    };
};

export const aSphere = (overrides?: Partial<Sphere>): Sphere => {
    return {
        id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : '14830037-c822-4498-8463-d3354c2fce66',
        eH: overrides && overrides.hasOwnProperty('eH') ? overrides.eH! : 'libero',
        name: overrides && overrides.hasOwnProperty('name') ? overrides.name! : 'est',
        metadata: overrides && overrides.hasOwnProperty('metadata') ? overrides.metadata! : aSphereMetaData(),
    };
};

export const aSphereMetaData = (overrides?: Partial<SphereMetaData>): SphereMetaData => {
    return {
        description: overrides && overrides.hasOwnProperty('description') ? overrides.description! : 'placeat',
        hashtag: overrides && overrides.hasOwnProperty('hashtag') ? overrides.hashtag! : 'facilis',
        image: overrides && overrides.hasOwnProperty('image') ? overrides.image! : 'esse',
    };
};

export const aSphereCreateParams = (overrides?: Partial<SphereCreateParams>): SphereCreateParams => {
    return {
        name: overrides && overrides.hasOwnProperty('name') ? overrides.name! : 'perspiciatis',
        description: overrides && overrides.hasOwnProperty('description') ? overrides.description! : 'nihil',
        hashtag: overrides && overrides.hasOwnProperty('hashtag') ? overrides.hashtag! : 'perspiciatis',
        image: overrides && overrides.hasOwnProperty('image') ? overrides.image! : 'officiis',
    };
};

export const aSphereUpdateParams = (overrides?: Partial<SphereUpdateParams>): SphereUpdateParams => {
    return {
        id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : 'f8706fe3-f5f1-4881-888f-50f3cf5a30a7',
        name: overrides && overrides.hasOwnProperty('name') ? overrides.name! : 'enim',
        description: overrides && overrides.hasOwnProperty('description') ? overrides.description! : 'quod',
        hashtag: overrides && overrides.hasOwnProperty('hashtag') ? overrides.hashtag! : 'aut',
        image: overrides && overrides.hasOwnProperty('image') ? overrides.image! : 'voluptates',
    };
};

export const anOrbitConnection = (overrides?: Partial<OrbitConnection>): OrbitConnection => {
    return {
        edges: overrides && overrides.hasOwnProperty('edges') ? overrides.edges! : [anOrbitEdge()],
        pageInfo: overrides && overrides.hasOwnProperty('pageInfo') ? overrides.pageInfo! : aPageInfo(),
    };
};

export const anOrbitEdge = (overrides?: Partial<OrbitEdge>): OrbitEdge => {
    return {
        cursor: overrides && overrides.hasOwnProperty('cursor') ? overrides.cursor! : 'placeat',
        node: overrides && overrides.hasOwnProperty('node') ? overrides.node! : anOrbit(),
    };
};

export const anOrbit = (overrides?: Partial<Orbit>): Orbit => {
    return {
        id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : 'cb6d9b13-cc5b-4d03-ab32-b7e56988c4e1',
        eH: overrides && overrides.hasOwnProperty('eH') ? overrides.eH! : 'exercitationem',
        name: overrides && overrides.hasOwnProperty('name') ? overrides.name! : 'tempora',
        sphereHash: overrides && overrides.hasOwnProperty('sphereHash') ? overrides.sphereHash! : 'ducimus',
        parentHash: overrides && overrides.hasOwnProperty('parentHash') ? overrides.parentHash! : 'error',
        childHash: overrides && overrides.hasOwnProperty('childHash') ? overrides.childHash! : 'ut',
        frequency: overrides && overrides.hasOwnProperty('frequency') ? overrides.frequency! : Frequency.OneShot,
        scale: overrides && overrides.hasOwnProperty('scale') ? overrides.scale! : Scale.Astro,
        metadata: overrides && overrides.hasOwnProperty('metadata') ? overrides.metadata! : anOrbitMetaData(),
    };
};

export const aTimeFrame = (overrides?: Partial<TimeFrame>): TimeFrame => {
    return {
        startTime: overrides && overrides.hasOwnProperty('startTime') ? overrides.startTime! : 0.44,
        endTime: overrides && overrides.hasOwnProperty('endTime') ? overrides.endTime! : 6.44,
    };
};

export const anOrbitMetaData = (overrides?: Partial<OrbitMetaData>): OrbitMetaData => {
    return {
        description: overrides && overrides.hasOwnProperty('description') ? overrides.description! : 'mollitia',
        timeframe: overrides && overrides.hasOwnProperty('timeframe') ? overrides.timeframe! : aTimeFrame(),
    };
};

export const anOrbitCreateParams = (overrides?: Partial<OrbitCreateParams>): OrbitCreateParams => {
    return {
        name: overrides && overrides.hasOwnProperty('name') ? overrides.name! : 'et',
        startTime: overrides && overrides.hasOwnProperty('startTime') ? overrides.startTime! : 1.27,
        endTime: overrides && overrides.hasOwnProperty('endTime') ? overrides.endTime! : 5.44,
        description: overrides && overrides.hasOwnProperty('description') ? overrides.description! : 'et',
        frequency: overrides && overrides.hasOwnProperty('frequency') ? overrides.frequency! : Frequency.OneShot,
        scale: overrides && overrides.hasOwnProperty('scale') ? overrides.scale! : Scale.Astro,
        sphereHash: overrides && overrides.hasOwnProperty('sphereHash') ? overrides.sphereHash! : 'dicta',
        parentHash: overrides && overrides.hasOwnProperty('parentHash') ? overrides.parentHash! : 'rerum',
        childHash: overrides && overrides.hasOwnProperty('childHash') ? overrides.childHash! : 'voluptatem',
    };
};

export const anOrbitUpdateParams = (overrides?: Partial<OrbitUpdateParams>): OrbitUpdateParams => {
    return {
        id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : '5e9990e6-4406-4794-b94d-f5a055814d5c',
        name: overrides && overrides.hasOwnProperty('name') ? overrides.name! : 'ab',
        startTime: overrides && overrides.hasOwnProperty('startTime') ? overrides.startTime! : 9.19,
        endTime: overrides && overrides.hasOwnProperty('endTime') ? overrides.endTime! : 9.75,
        description: overrides && overrides.hasOwnProperty('description') ? overrides.description! : 'hic',
        frequency: overrides && overrides.hasOwnProperty('frequency') ? overrides.frequency! : Frequency.OneShot,
        scale: overrides && overrides.hasOwnProperty('scale') ? overrides.scale! : Scale.Astro,
        sphereHash: overrides && overrides.hasOwnProperty('sphereHash') ? overrides.sphereHash! : 'omnis',
        parentHash: overrides && overrides.hasOwnProperty('parentHash') ? overrides.parentHash! : 'minima',
    };
};

export const anOrbitHierarchyQueryParams = (overrides?: Partial<OrbitHierarchyQueryParams>): OrbitHierarchyQueryParams => {
    return {
        orbitEntryHashB64: overrides && overrides.hasOwnProperty('orbitEntryHashB64') ? overrides.orbitEntryHashB64! : 'aut',
        levelQuery: overrides && overrides.hasOwnProperty('levelQuery') ? overrides.levelQuery! : aQueryParamsLevel(),
    };
};

export const aQueryParamsLevel = (overrides?: Partial<QueryParamsLevel>): QueryParamsLevel => {
    return {
        sphereHashB64: overrides && overrides.hasOwnProperty('sphereHashB64') ? overrides.sphereHashB64! : 'cum',
        orbitLevel: overrides && overrides.hasOwnProperty('orbitLevel') ? overrides.orbitLevel! : 9.99,
    };
};

export const aWinRecord = (overrides?: Partial<WinRecord>): WinRecord => {
    return {
        id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : '6bfc102e-ed02-4806-99c1-60076c112a01',
        eH: overrides && overrides.hasOwnProperty('eH') ? overrides.eH! : 'sit',
        orbitId: overrides && overrides.hasOwnProperty('orbitId') ? overrides.orbitId! : '6574de32-9e95-474b-8c9d-838a3135605c',
        winData: overrides && overrides.hasOwnProperty('winData') ? overrides.winData! : [aWinDateEntry()],
    };
};

export const aWinDateEntry = (overrides?: Partial<WinDateEntry>): WinDateEntry => {
    return {
        date: overrides && overrides.hasOwnProperty('date') ? overrides.date! : 'temporibus',
        value: overrides && overrides.hasOwnProperty('value') ? overrides.value! : aSingleWin(),
    };
};

export const aSingleWin = (overrides?: Partial<SingleWin>): SingleWin => {
    return {
        single: overrides && overrides.hasOwnProperty('single') ? overrides.single! : false,
    };
};

export const aMultipleWins = (overrides?: Partial<MultipleWins>): MultipleWins => {
    return {
        multiple: overrides && overrides.hasOwnProperty('multiple') ? overrides.multiple! : [false],
    };
};

export const anOrbitWinRecordQueryParams = (overrides?: Partial<OrbitWinRecordQueryParams>): OrbitWinRecordQueryParams => {
    return {
        orbitEh: overrides && overrides.hasOwnProperty('orbitEh') ? overrides.orbitEh! : 'ut',
        yearDotMonth: overrides && overrides.hasOwnProperty('yearDotMonth') ? overrides.yearDotMonth! : 'voluptatem',
    };
};

export const aWinRecordCreateParams = (overrides?: Partial<WinRecordCreateParams>): WinRecordCreateParams => {
    return {
        orbitEh: overrides && overrides.hasOwnProperty('orbitEh') ? overrides.orbitEh! : 'vero',
        winData: overrides && overrides.hasOwnProperty('winData') ? overrides.winData! : [aWinDateEntryInput()],
    };
};

export const aWinRecordUpdateParams = (overrides?: Partial<WinRecordUpdateParams>): WinRecordUpdateParams => {
    return {
        winRecordId: overrides && overrides.hasOwnProperty('winRecordId') ? overrides.winRecordId! : '4bf18e6e-d5d6-4ca0-a269-1ce3f8ee2f8c',
        updatedWinRecord: overrides && overrides.hasOwnProperty('updatedWinRecord') ? overrides.updatedWinRecord! : aWinRecordCreateParams(),
    };
};

export const aWinDateEntryInput = (overrides?: Partial<WinDateEntryInput>): WinDateEntryInput => {
    return {
        date: overrides && overrides.hasOwnProperty('date') ? overrides.date! : 'perspiciatis',
        single: overrides && overrides.hasOwnProperty('single') ? overrides.single! : true,
        multiple: overrides && overrides.hasOwnProperty('multiple') ? overrides.multiple! : [true],
    };
};
