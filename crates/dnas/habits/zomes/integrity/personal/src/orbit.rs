use hdi::prelude::{holo_hash::{EntryHashB64}, *};

use std::rc::Rc;
use std::cell::RefCell;

#[hdk_entry_helper]
#[derive(Clone)]
#[serde(rename_all = "camelCase")]
pub struct Orbit {
    pub name: String,
    pub parent_hash: Option<EntryHashB64>,
    pub child_hash: Option<EntryHashB64>,
    pub sphere_hash: EntryHashB64,
    pub frequency: String,
    pub scale: String,
    pub metadata: Option<OrbitMetadata>,
}

impl Orbit {
    fn _new(name: &str, parent_hash: Option<EntryHashB64>, child_hash: Option<EntryHashB64>, sphere_hash: EntryHashB64, frequency: String, scale: String, metadata: Option<OrbitMetadata>) -> Self {
        Orbit {
            name: name.to_string(),
            parent_hash,
            child_hash,
            sphere_hash,
            frequency,
            scale,
            metadata,
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Node {
    pub id: EntryHashB64,
    pub children: Vec<Rc<RefCell<Node>>>,
}

impl Node {
    pub fn new(id: EntryHashB64, children: Vec<Rc<RefCell<Node>>>) -> Self {
        Node { id, children }
    }

    pub fn to_json(&self) -> serde_json::Value {
        serde_json::json!({
            "content": self.id,
            "name": self.id,
            "children": self.children.iter().map(|child| child.borrow_mut().to_json()).collect::<Vec<_>>(),
        })
    }
}

#[derive(Serialize, Deserialize, Clone, PartialEq, Debug)]
#[serde(rename_all = "camelCase")]
pub struct OrbitMetadata {
    pub description: Option<String>,
    pub timeframe: TimeFrame,
}

#[derive(Serialize, Deserialize, Clone, PartialEq, Debug)]
#[serde(rename_all = "camelCase")]
pub struct TimeFrame {
    pub start_time: u64,
    pub end_time: Option<u64>,
}

pub fn validate_create_orbit(
    _action: EntryCreationAction,
    _orbit: Orbit,
) -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Valid)
}
pub fn validate_update_orbit(
    _action: Update,
    _orbit: Orbit,
    _original_action: EntryCreationAction,
    _original_orbit: Orbit,
) -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Valid)
}
pub fn validate_delete_orbit(
    _action: Delete,
    _original_action: EntryCreationAction,
    _original_orbit: Orbit,
) -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Valid)
}
pub fn validate_create_link_orbit_updates(
    _action: CreateLink,
    base_address: AnyLinkableHash,
    target_address: AnyLinkableHash,
    _tag: LinkTag,
) -> ExternResult<ValidateCallbackResult> {
    // Check the entry type for the given action hash
    let action_hash = base_address
        .into_action_hash()
        .ok_or(wasm_error!(WasmErrorInner::Guest(String::from(
            "No action hash associated with link"
        ))))?;
    let record = must_get_valid_record(action_hash)?;
    let _orbit: crate::Orbit = record
        .entry()
        .to_app_option()
        .map_err(|e| wasm_error!(e))?
        .ok_or(wasm_error!(WasmErrorInner::Guest(String::from(
            "Linked action must reference an entry"
        ))))?;
    // Check the entry type for the given action hash
    let action_hash =
        target_address
            .into_action_hash()
            .ok_or(wasm_error!(WasmErrorInner::Guest(String::from(
                "No action hash associated with link"
            ))))?;
    let record = must_get_valid_record(action_hash)?;
    let _orbit: crate::Orbit = record
        .entry()
        .to_app_option()
        .map_err(|e| wasm_error!(e))?
        .ok_or(wasm_error!(WasmErrorInner::Guest(String::from(
            "Linked action must reference an entry"
        ))))?;
    // TODO: add the appropriate validation rules
    Ok(ValidateCallbackResult::Valid)
}
pub fn validate_delete_link_orbit_updates(
    _action: DeleteLink,
    _original_action: CreateLink,
    _base: AnyLinkableHash,
    _target: AnyLinkableHash,
    _tag: LinkTag,
) -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Invalid(String::from(
        "OrbitUpdates links cannot be deleted",
    )))
}
