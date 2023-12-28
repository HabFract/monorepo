import { CallableCell } from '@holochain/tryorama';
import { NewEntryAction, ActionHash, Record, AppBundleSource, fakeActionHash, fakeAgentPubKey, fakeEntryHash, fakeDnaHash } from '@holochain/client';



export async function sampleSphere(cell: CallableCell, partialSphere = {}) {
    return {
        ...{
        name: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        metadata: 1674053334548000,
        },
        ...partialSphere
    };
}

export async function createSphere(cell: CallableCell, sphere = undefined): Promise<Record> {
    return cell.callZome({
        zome_name: "personal",
        fn_name: "create_sphere",
        payload: sphere || await sampleSphere(cell),
    });
}

