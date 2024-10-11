use hdk::prelude::*;
use personal_integrity::*;

#[hdk_extern]
pub fn create_win_record(win_record: WinRecord) -> ExternResult<Record> {
    let win_record_hash = create_entry(&EntryTypes::WinRecord(win_record.clone()))?;
    let record = get(win_record_hash.clone(), GetOptions::default())?
        .ok_or(
            wasm_error!(
                WasmErrorInner::Guest(String::from("Could not find the newly created WinRecord"))
            ),
        )?;
    Ok(record)
}


#[hdk_extern]
pub fn get_my_win_record(original_win_record_hash: ActionHash) -> ExternResult<Option<Record>> {
    get_latest(original_win_record_hash)
}

#[hdk_extern]
pub fn get_win_record(original_win_record_hash: ActionHash) -> ExternResult<Option<Record>> {
    let links = get_links(
            GetLinksInputBuilder::try_new(original_win_record_hash.clone(), LinkTypes::WinRecordUpdates)?
                .build()
            )?;
    let latest_link = links
        .into_iter()
        .max_by(|link_a, link_b| link_a.timestamp.cmp(&link_b.timestamp));
    let latest_win_record_hash = match latest_link {
        Some(link) => {
            link
                .target
                .clone()
                .into_action_hash()
                .ok_or(
                    wasm_error!(
                        WasmErrorInner::Guest(String::from("No action hash associated with link"))
                    ),
                )?
        }
        None => original_win_record_hash.clone(),
    };
    get(latest_win_record_hash, GetOptions::default())
}

#[derive(Serialize, Deserialize, Debug)]

#[serde(rename_all = "camelCase")]
pub struct UpdateWinRecordInput {
    pub win_record_id: ActionHash,
    pub updated_win_record: WinRecord,
}

#[hdk_extern]
pub fn update_win_record(input: UpdateWinRecordInput) -> ExternResult<Option<Record>> {
    let updated_win_record_hash = update_entry(input.win_record_id.clone(), &input.updated_win_record)?;

    // let _link_deleted = delete_win_record_hash_link(
    //     input.updated_win_record.win_record_hash.clone().into(),
    //     input.original_win_record_hash.clone(),
    // )?; TODO: need to delete and replace all old win_record orbit links?

    // // Create win_record link to updated header
    // create_link(
    //     input.updated_win_record.win_record_hash.clone(), // Assume the WinRecord cannot be change and validation will be added to ensure this
    //     updated_win_record_hash.clone(),
    //     LinkTypes::WinRecordToOrbit,
    //     (),
    // )?;

    get_latest(updated_win_record_hash.clone())
}

#[hdk_extern]
pub fn create_my_win_record(win_record: WinRecord) -> ExternResult<Record> {
    let win_record_hash = create_entry(&EntryTypes::WinRecord(win_record.clone()))?;
    let record = get(win_record_hash.clone(), GetOptions::default())?
        .ok_or(
            wasm_error!(
                WasmErrorInner::Guest(String::from("Could not find the newly created WinRecord"))
            ),
        )?;

    Ok(record)
}

/** Private helpers */

fn get_latest(action_hash: ActionHash) -> ExternResult<Option<Record>> {
    let details = get_details(action_hash, GetOptions::default())?.ok_or(wasm_error!(
        WasmErrorInner::Guest("WinRecord not found".into())
    ))?;

    match details {
        Details::Entry(_) => Err(wasm_error!(WasmErrorInner::Guest(
            "Malformed details".into()
        ))),
        Details::Record(element_details) => match element_details.updates.last() {
            Some(update) => get_latest(update.action_address().clone()),
            None => match element_details.deletes.last() {
                Some(_delete) => Ok(None),
                _ => Ok(Some(element_details.record)),
            },
        },
    }
}

// Link helpers

