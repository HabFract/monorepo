use hdk::prelude::{*, holo_hash::hash_type::AnyLinkable};
use personal_integrity::LinkTypes;

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

pub fn get_links_from_base(
  base: impl Into<HoloHash<AnyLinkable>>,
  link_type: impl LinkTypeFilterExt,
  link_tag: Option<LinkTag>,
) -> ExternResult<Option<Vec<Link>>> {
  let links = get_links(base, link_type, link_tag)?;
  if links.len() == 0 {
      return Ok(None);
  }
  Ok(Some(links))
}

pub fn sphere_to_orbit_links(sphere_hash: EntryHash) -> ExternResult<Option<Vec<Link>>> {
    get_links_from_base(sphere_hash, LinkTypes::SphereToOrbit, None)
}
