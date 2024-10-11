use std::collections::HashMap;

use hdi::prelude::*;

#[hdk_entry_helper]
#[derive(Clone)]
#[serde(rename_all = "camelCase")]
pub struct WinRecord {
    pub orbit_id: EntryHashB64,
    pub win_data: WinData,
}

#[derive(Clone, Deserialize, Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub enum WinDateValue {
    Single(bool),
    Multiple(Vec<bool>),
}
// The String index here will be a date e.g. 12/01/2021
pub type WinData = HashMap<DateString, WinDateValue>;

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct DateString(String);

impl DateString {
    pub fn new(date: String) -> Result<Self, String> {
        if Self::is_valid_date_format(&date) {
            Ok(DateString(date))
        } else {
            Err("Invalid date format. Expected DD/MM/YYYY".to_string())
        }
    }

    fn is_valid_date_format(date: &str) -> bool {
        if date.len() != 10 {
            return false;
        }

        let parts: Vec<&str> = date.split('/').collect();
        if parts.len() != 3 {
            return false;
        }

        let day = parts[0].parse::<u32>().unwrap_or(0);
        let month = parts[1].parse::<u32>().unwrap_or(0);
        let year = parts[2].parse::<u32>().unwrap_or(0);

        // Basic validation (not checking for leap years or exact days per month)
        day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 2000 && year <= 2100
    }
}

pub fn validate_create_wins(
    _action: EntryCreationAction,
    wins: WinRecord,
) -> ExternResult<ValidateCallbackResult> {
    // Validate all date strings in the WinRecord
    for (date_string, _value) in wins.win_data.iter() {
        if !DateString::is_valid_date_format(&date_string.0) {
            return Ok(ValidateCallbackResult::Invalid(format!(
                "Invalid date format: {}",
                date_string.0
            )));
        }
    }
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
