use crate::utils::{
    delete_month_bucket_win_record_link, entry_from_record, extract_year_dot_month, get_latest,
    get_path_links_from_year_dot_month, group_win_data_by_year_dot_month,
    win_record_year_month_anchor,
};
use hdk::prelude::*;
use personal_integrity::*;

/// Take a set of WinData (which we assume is not confined to a particular month), bucket it into months and create or update linked WinRecords for each month
#[hdk_extern]
pub fn create_or_update_win_records(win_record: WinRecord) -> ExternResult<Vec<Record>> {
    let bucketed_win_data = group_win_data_by_year_dot_month(&win_record.win_data);
    let mut created_records: Vec<Record> = vec![];
    for (_year_dot_month, win_data_month_bucket) in bucketed_win_data {
        let orbit_id_clone = win_record.orbit_id.clone();
        // TODO:
        // - first check if one exists already for that orbit id and if so update it instead
        let win_record = create_or_update_win_record(WinRecord {
            orbit_id: orbit_id_clone,
            win_data: win_data_month_bucket,
        })?;
        created_records.push(win_record);
    }
    Ok(created_records)
}

/// Create or update a single WinRecord for an orbit without bucketing by date
#[hdk_extern]
pub fn create_or_update_win_record(win_record: WinRecord) -> ExternResult<Record> {
    let win_record_hash = create_entry(&EntryTypes::WinRecord(win_record.clone()))?;
    let record = get(win_record_hash.clone(), GetOptions::default())?.ok_or(wasm_error!(
        WasmErrorInner::Guest(String::from("Could not find the newly created WinRecord"))
    ))?;
    let date_indices = win_record.win_data.keys();
    let date_index = date_indices
        .clone()
        .next()
        .expect("This is an empty WinRecord");
    let prefix = extract_year_dot_month(date_index.as_str())
        .ok_or(wasm_error!(WasmErrorInner::Guest(String::from(
            "Could not parse provided WinData date index into YYYY.MM"
        ))))
        .expect("This is not a valid WinData index");
    let path = win_record_year_month_anchor(&prefix)?;
    path.ensure()?;

    // Create anchor link to prefix path YYYY.MM
    let _link = create_link(
        path.path_entry_hash()?,
        win_record_hash.clone(),
        LinkTypes::WinRecordYearMonthPrefixPath,
        (),
    )?;

    Ok(record)
}

/// Get a single latest WinRecord from the source chain using its ActionHash
#[hdk_extern]
pub fn get_my_win_record(original_win_record_hash: ActionHash) -> ExternResult<Option<Record>> {
    get_latest(original_win_record_hash)
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct UpdateWinRecordInput {
    pub win_record_id: ActionHash,
    pub updated_win_record: WinRecord,
}

#[hdk_extern]
pub fn update_win_record(input: UpdateWinRecordInput) -> ExternResult<Option<Record>> {
    // Update entry
    let updated_win_record_hash =
        update_entry(input.win_record_id.clone(), &input.updated_win_record)?;

    // Clean up links related to old action
    let old_record =
        get(input.win_record_id.clone(), GetOptions::default())?.ok_or(wasm_error!(
            WasmErrorInner::Guest(String::from("Could not find the original WinRecord"))
        ))?;
    let old_win_record = entry_from_record::<WinRecord>(old_record.clone())?;
    let _old_entry_hash = hash_entry(&old_win_record)?;
    let date_indices = input.updated_win_record.win_data.keys();
    let date_index = date_indices
        .clone()
        .next()
        .expect("This is an empty WinRecord");
    let prefix = extract_year_dot_month(date_index.as_str()).ok_or(wasm_error!(
        WasmErrorInner::Guest(String::from("Could not parse prefix from WinRecord key"))
    ))?;
    let _link_deleted = delete_month_bucket_win_record_link(&prefix, input.win_record_id)?;

    let path = win_record_year_month_anchor(&prefix)?;
    path.ensure()?;
    // Create new link from YYYYMM path to related update action
    create_link(
        path.path_entry_hash()?,
        updated_win_record_hash.clone(),
        LinkTypes::WinRecordYearMonthPrefixPath,
        (),
    )?;

    get_latest(updated_win_record_hash.clone())
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct OrbitWinRecordQueryParams {
    pub orbit_id: EntryHashB64,
    pub year_dot_month: String,
}

/// Query the source chain for WinRecords linked to a particular orbit and tagged for a given YYYY.MM.
/// Return a vec of Records (which will be empty if none were found)
#[hdk_extern]
pub fn get_an_orbits_win_record_for_month(
    params: OrbitWinRecordQueryParams,
) -> ExternResult<Vec<Record>> {
    let maybe_links = get_path_links_from_year_dot_month(&params.year_dot_month)?;

    if let Some(links) = maybe_links {
        let mut query_hashes: HashSet<EntryHash> = HashSet::new();
        let records: Vec<Record> = links
            .into_iter()
            .filter_map(|link| link.target.clone().into_action_hash())
            .map(|ah| get_latest(ah))
            .filter_map(|result| match result {
                Ok(Some(record)) => Some(record),
                _ => None,
            })
            .collect();

        for record in records {
            if let Some(hash) = record.action().entry_hash() {
                query_hashes.insert(hash.clone().into());
            }
        }
        let filter = ChainQueryFilter::new()
            .entry_hashes(query_hashes)
            .include_entries(true);
        let my_win_records = query(filter)?;
        return Ok(my_win_records);
    }
    Ok(vec![])
}

#[hdk_extern]
pub fn get_all_orbit_win_records_for_month(year_dot_month: String) -> ExternResult<Vec<Record>> {
    let maybe_links = get_path_links_from_year_dot_month(&year_dot_month)?;

    if let Some(links) = maybe_links {
        let mut query_hashes: HashSet<EntryHash> = HashSet::new();
        let records: Vec<Record> = links
            .into_iter()
            .filter_map(|link| link.target.clone().into_action_hash())
            .map(|ah| get_latest(ah))
            .filter_map(|result| match result {
                Ok(Some(record)) => Some(record),
                _ => None,
            })
            .collect();
        for record in records {
            if let Some(hash) = record.action().entry_hash() {
                query_hashes.insert(hash.clone().into());
            }
        }
        let filter = ChainQueryFilter::new()
            .entry_hashes(query_hashes)
            .include_entries(true);
        let my_win_records = query(filter)?;
        return Ok(my_win_records);
    }
    Ok(vec![])
}
