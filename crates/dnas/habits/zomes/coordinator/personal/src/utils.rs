use std::collections::HashMap;

use hdk::prelude::{*, holo_hash::hash_type::AnyLinkable};
use personal_integrity::{LinkTypes, WinData};

/// Iterate through the updates of a given entry, returning the latest record, or None if the entry was deleted
pub fn get_latest(action_hash: ActionHash) -> ExternResult<Option<Record>> {
  let details = get_details(action_hash, GetOptions::default())?.ok_or(wasm_error!(
      WasmErrorInner::Guest("Record not found for given ActionHash".into())
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

pub fn entry_from_record<T: TryFrom<SerializedBytes, Error = SerializedBytesError>>(
  record: Record,
) -> ExternResult<T> {
  Ok(record
      .entry()
      .to_app_option()
      .map_err(|err| wasm_error!(WasmErrorInner::from(err)))?
      .ok_or(wasm_error!(WasmErrorInner::Guest(String::from(
          "Malformed bytes"
      ))))?)
}

/// Link Helpers

pub fn get_links_from_base(
  base: impl Into<HoloHash<AnyLinkable>>,
  link_type: impl LinkTypeFilterExt,
  link_tag: Option<LinkTag>,
) -> ExternResult<Option<Vec<Link>>> {
  if let Some(tag) = link_tag {
    let links = get_links(
      GetLinksInputBuilder::try_new(base, link_type)?
      .tag_prefix(tag)
      .build()
    )?;
    if links.len() == 0 {
      return Ok(None);
    }
    Ok(Some(links))
  } else {
    let links = get_links(
      GetLinksInputBuilder::try_new(base, link_type)?
      .build()
    )?;
    if links.len() == 0 {
      return Ok(None);
    }
    Ok(Some(links))
  }
}

pub fn sphere_to_orbit_links(sphere_hash: EntryHash) -> ExternResult<Option<Vec<Link>>> {
    get_links_from_base(sphere_hash, LinkTypes::SphereToOrbit, None)
}

/// Date Helpers

pub type YYMM = String;

pub fn group_win_data_by_year_dot_month(win_data: &WinData) -> HashMap<String, WinData> {
    let mut grouped_data: HashMap<YYMM, WinData> = HashMap::new();

    for (date_string, win_value) in win_data {
        if let Some(group_key) = extract_year_dot_month(&date_string) {
            grouped_data
                .entry(group_key)
                .or_insert_with(HashMap::new)
                .insert(date_string.clone(), win_value.clone());
        }
    }

    grouped_data
}

pub fn extract_year_dot_month(date_string: &str) -> Option<String> {
  let parts: Vec<&str> = date_string.split('/').collect();
  if parts.len() == 3 {
      let month = parts[1];
      let year = parts[2];
      Some(format!("{}.{}", year, month))
  } else {
      None
  }
}