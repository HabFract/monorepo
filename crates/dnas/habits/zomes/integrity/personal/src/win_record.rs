use std::collections::HashMap;

use hdi::prelude::*;

#[hdk_entry_helper]
#[derive(Clone)]
#[serde(rename_all = "camelCase")]
pub struct WinRecord {
    pub orbit_eh: EntryHashB64,
    pub win_data: WinData,
}

#[derive(Clone, Deserialize, Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub enum WinDateValue {
    Single(bool),
    Multiple(Vec<bool>),
}
// The String index here will be a date e.g. 12/01/2021
pub type DDMMYYYY = String;
pub type WinData = HashMap<DDMMYYYY, WinDateValue>;

pub fn validate_create_wins(
    _action: EntryCreationAction,
    _wins: WinRecord,
) -> ExternResult<ValidateCallbackResult> {

    Ok(ValidateCallbackResult::Valid)
}
pub fn validate_update_wins(
    _action: Update,
    _wins: WinRecord,
    _original_action: EntryCreationAction,
    _original_wins: WinRecord,
) -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Valid)
}
pub fn validate_delete_wins(
    _action: Delete,
    _original_action: EntryCreationAction,
    _original_wins: WinRecord,
) -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Valid)
}
