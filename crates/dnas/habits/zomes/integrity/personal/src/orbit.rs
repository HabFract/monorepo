use std::collections::HashMap;

use hdi::prelude::{holo_hash::EntryHashB64, *};

#[hdk_entry_helper]
#[derive(Clone)]
pub struct Orbit {
    pub name: String,
    pub parent_hash: Option<EntryHash>,
    pub metadata: Option<OrbitMetadata>,
}

impl Orbit {
    fn new(name: &str, parent_hash: Option<EntryHash>, metadata: Option<OrbitMetadata>) -> Self {
        Orbit {
            name: name.to_string(),
            metadata,
            parent_hash,
        }
    }
}

#[derive(Debug)]
struct Node {
    id: EntryHashB64,
    children: Vec<Box<Node>>,
}

impl Node {
    fn new(id: EntryHashB64, children: Vec<Box<Node>>) -> Self {
        Node { id, children }
    }

    fn to_json(&self) -> serde_json::Value {
        serde_json::json!({
            "id": self.id,
            "children": self.children.iter().map(|child| child.to_json()).collect::<Vec<_>>(),
        })
    }
}

fn build_tree(orbits: &[Orbit]) -> ExternResult<HashMap<EntryHashB64, Box<Node>>> {
    let mut tree: HashMap<EntryHashB64, Box<Node>> = HashMap::new();

    for orbit in orbits {
        let entry_hash = hash_entry(orbit.clone());
        if let Ok(hash) = entry_hash {
            let node = Box::new(Node::new(hash.clone().into(), Vec::new()));

            match orbit.parent_hash.clone() {
                Some(parent_hash) => {
                    if let Some(parent_node) = tree.get_mut(&parent_hash.clone().into()) {
                        parent_node.children.push(node);
                    }
                }
                None => {
                    tree.insert(hash.clone().into(), node);
                }
            }
        }
    }
    Ok(tree)
}

#[derive(Serialize, Deserialize, Clone, PartialEq, Debug)]
pub struct OrbitMetadata {
    pub description: Option<String>,
    pub hashtag: Option<String>,
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
