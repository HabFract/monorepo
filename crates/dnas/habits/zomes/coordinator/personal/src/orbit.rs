use hdk::prelude::{
    holo_hash::{hash_type::AnyLinkable, EntryHashB64},
    *,
};
use personal_integrity::*;
use std::{cell::RefCell, collections::HashMap, ops::RangeInclusive, rc::Rc};

use crate::utils::{entry_from_record, get_links_from_base, sphere_to_orbit_links};

#[hdk_extern]
pub fn create_orbit(orbit: Orbit) -> ExternResult<Record> {
    let orbit_hash = create_entry(&EntryTypes::Orbit(orbit.clone()))?;
    let record = get(orbit_hash.clone(), GetOptions::default())?.ok_or(wasm_error!(
        WasmErrorInner::Guest(String::from("Could not find the newly created Orbit"))
    ))?;
    Ok(record)
}

// Used internally in extern functions to provide latest updated/live record
fn get_latest(action_hash: ActionHash) -> ExternResult<Option<Record>> {
    let details = get_details(action_hash, GetOptions::default())?
        .ok_or(wasm_error!(WasmErrorInner::Guest("Orbit not found".into())))?;

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

#[hdk_extern]
pub fn get_my_orbit(original_orbit_hash: ActionHash) -> ExternResult<Option<Record>> {
    get_latest(original_orbit_hash.into())
}

pub fn get_orbit(original_orbit_hash: ActionHash) -> ExternResult<Option<Record>> {
    let links = get_links(
        GetLinksInputBuilder::try_new(original_orbit_hash.clone(), LinkTypes::OrbitUpdates)?
            .build()
        )?;
    let latest_link = links
        .into_iter()
        .max_by(|link_a, link_b| link_a.timestamp.cmp(&link_b.timestamp));
    let latest_orbit_hash = match latest_link {
        Some(link) => {
            link.target
                .clone()
                .into_action_hash()
                .ok_or(wasm_error!(WasmErrorInner::Guest(String::from(
                    "No action hash associated with link"
                ))))?
        }
        None => original_orbit_hash.clone(),
    };
    get(latest_orbit_hash, GetOptions::default())
}
#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct UpdateOrbitInput {
    pub original_orbit_hash: ActionHash,
    pub updated_orbit: Orbit,
}
#[hdk_extern]
pub fn update_orbit(input: UpdateOrbitInput) -> ExternResult<Option<Record>> {
    let updated_orbit_hash = update_entry(input.original_orbit_hash.clone(), &input.updated_orbit)?;

    let path = prefix_path(input.updated_orbit.name.clone())?;
    path.ensure()?;

    let _link_deleted = delete_sphere_hash_link(
        input.updated_orbit.sphere_hash.clone().into(),
        input.original_orbit_hash.clone(),
    )?;

    // Create sphere link to updated header
    create_link(
        input.updated_orbit.sphere_hash.clone(), // Assume the Sphere cannot be change and validation will be added to ensure this
        updated_orbit_hash.clone(),
        LinkTypes::SphereToOrbit,
        (),
    )?;

    // Create anchor link to updated header
    create_link(
        path.path_entry_hash()?,
        updated_orbit_hash.clone(),
        LinkTypes::OrbitsPrefixPath,
        input.updated_orbit.name.as_bytes().to_vec(),
    )?;

    get_latest(updated_orbit_hash.clone())
}

#[hdk_extern]
pub fn delete_orbit(original_orbit_hash: ActionHash) -> ExternResult<ActionHash> {
    let maybe_record = get_latest(original_orbit_hash.clone())?;
    if let Some(record) = maybe_record {
        let orbit = entry_from_record::<Orbit>(record.clone())?;

        let _link_deleted = delete_sphere_hash_link(
            orbit.sphere_hash.clone().into(),
            original_orbit_hash.clone(),
        )?;

        delete_entry(original_orbit_hash)
    } else {
        Err(wasm_error!(WasmErrorInner::Guest(String::from(
            "Could not find the Orbit's record to delete"
        ))))
    }
}

#[hdk_extern]
pub fn create_my_orbit(orbit: Orbit) -> ExternResult<Record> {
    let orbit_action_hash = create_entry(&EntryTypes::Orbit(orbit.clone()))?;
    let orbit_entry_hash = hash_entry(&orbit)?;
    let record = get(orbit_action_hash.clone(), GetOptions::default())?.ok_or(wasm_error!(
        WasmErrorInner::Guest(String::from("Could not find the newly created Orbit"))
    ))?;

    // Create path links for name querying
    let path = prefix_path(orbit.name.clone())?;
    path.ensure()?;
    create_link(
        path.path_entry_hash()?,
        orbit_action_hash.clone(),
        LinkTypes::OrbitsPrefixPath,
        orbit.name.as_bytes().to_vec(),
    )?;
    // Create Sphere link
    create_link(
        orbit.sphere_hash.clone(),
        orbit_action_hash.clone(),
        LinkTypes::SphereToOrbit,
        (),
    )?;

    // Create Orbit parent link
    if let Some(parent_hash) = orbit.parent_hash {
        create_link(
            parent_hash.clone(),
            orbit_entry_hash.clone(),
            LinkTypes::OrbitParentToChild,
            (),
        )?;
        // Get the parent's level and add a level + 1 link
        let sphere_level_links = get_links_from_base(
            orbit.sphere_hash.clone(),
            LinkTypes::OrbitHierarchyLevel,
            None,
        )?;

        if let Some(links) = sphere_level_links {
            let mut parent_level_link = links
                .into_iter()
                .filter(|link| link.clone().target == parent_hash.clone().into());

            match parent_level_link.next() {
                Some(link) => {

                    let tag_bytes = link.clone().tag.0.try_into().unwrap();
                    let from_bytes  = i8::from_ne_bytes(tag_bytes);

                    let new_link_level = from_bytes + 1;
                    let link_tag_bytes = new_link_level.to_ne_bytes().to_vec();
                    create_link(
                        orbit.sphere_hash.clone(),
                        orbit_entry_hash.clone(),
                        LinkTypes::OrbitHierarchyLevel,
                        LinkTag(link_tag_bytes),
                    )?;
                },
                _ => { Err(wasm_error!(WasmErrorInner::Guest(
                    "Could not add a new level link to the created orbit. Hierarchy queries may fail or provide inaccuracies".to_string()
                )))?
                }
            }
        }
    } else {
        // There is no parent
        if let Some(child_hash) = orbit.child_hash {
            create_link(
                orbit_entry_hash.clone(),
                child_hash.clone(),
                LinkTypes::OrbitParentToChild,
                (),
            )?;
            // Get the child's level and add a level - 1 link
            let sphere_level_links = get_links_from_base(
                orbit.sphere_hash.clone(),
                LinkTypes::OrbitHierarchyLevel,
                None,
            )?;

            if let Some(links) = sphere_level_links {
                let mut child_level_link = links
                    .into_iter()
                    .filter(|link| link.clone().target == child_hash.clone().into());
                
                match child_level_link.next() {
                    Some(link) => {
                        let tag_bytes = link.clone().tag.0.try_into().unwrap();
                        let from_bytes  = i8::from_ne_bytes(tag_bytes);

                        let new_link_level = from_bytes - 1;
                        let link_tag_bytes = new_link_level.to_ne_bytes().to_vec();
                        create_link(
                            orbit.sphere_hash.clone(),
                            orbit_entry_hash.clone(),
                            LinkTypes::OrbitHierarchyLevel,
                            LinkTag(link_tag_bytes),
                        )?;
                    },
                    _ => { Err(wasm_error!(WasmErrorInner::Guest(
                        "Could not add a new level link to the created orbit. Hierarchy queries may fail or provide inaccuracies".to_string()
                    )))?
                    }
                }
            }
        } else {
            // This is a root node so its level is 0 (temp) TODO: choose whether to allow multiple level 0s
            let link_tag_bytes = 0_i8.to_be_bytes().to_vec();
            create_link(
                orbit.sphere_hash.clone(),
                orbit_entry_hash,
                LinkTypes::OrbitHierarchyLevel,
                LinkTag(link_tag_bytes),
            )?;
        }
    }
    Ok(record)
}

#[hdk_extern]
pub fn _get_all_my_historic_orbit_records(_: ()) -> ExternResult<Vec<Record>> {
    let orbit_entry_type: EntryType = UnitEntryTypes::Orbit.try_into()?;
    let filter = ChainQueryFilter::new()
        .entry_type(orbit_entry_type)
        .include_entries(true);

    let all_my_orbits = query(filter)?;

    Ok(all_my_orbits)
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct SphereOrbitsQueryParams {
    pub sphere_hash: EntryHashB64,
}

#[hdk_extern]
pub fn get_all_my_sphere_orbits(
    SphereOrbitsQueryParams { sphere_hash }: SphereOrbitsQueryParams,
) -> ExternResult<Vec<Record>> {
    let maybe_links = sphere_to_orbit_links(sphere_hash.into())?;

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
        let my_sphere_orbits = query(filter)?;
        return Ok(my_sphere_orbits);
    }
    Ok(vec![])
}

#[hdk_extern]
pub fn get_lowest_sphere_hierarchy_level(sphere_hash_b64: EntryHashB64) -> ExternResult<i8> {
    let level_links_for_sphere =
        get_links_from_base(sphere_hash_b64, LinkTypes::OrbitHierarchyLevel, None);
    return if let Ok(Some(links)) = level_links_for_sphere {
        let maybe_min = links.iter().min_by(|&a, &b| {
            let tag_a_bytes = a.clone().tag.0.try_into().unwrap();
            let from_bytes_a  = i8::from_ne_bytes(tag_a_bytes);
            let tag_b_bytes = b.clone().tag.0.try_into().unwrap();
            let from_bytes_b  = i8::from_ne_bytes(tag_b_bytes);

    debug!(
        "_+_+_+_+_+_+_+_+_+_ Compare tags: {:#?} {:#?}",
        from_bytes_a.clone(),
        from_bytes_b.clone(),
    );

            return from_bytes_a.cmp(&from_bytes_b);
        });
        if let Some(ref min) = maybe_min {
            let bytes : [u8; 1] = min.tag.clone().0.try_into().unwrap();
            let from_bytes = i8::from_ne_bytes(bytes); 
            Ok(from_bytes)
        } else {
            Err(wasm_error!(WasmErrorInner::Guest(
                "Could not find a minimum sphere hierarchy level from link tags".to_string()
            )))
        }
    } else {
        Err(wasm_error!(WasmErrorInner::Guest(
            "No sphere level links found for this sphere".to_string()
        )))
    };
}

#[hdk_extern]
pub fn get_orbit_hierarchy_json(input: OrbitHierarchyInput) -> ExternResult<serde_json::Value> {
    // Query based on orbit entry hash only, or it could be a recursive call from a levels query
    if let Some(entry_hash) = input.orbit_entry_hash_b64 {
        // Set an empty hashset to be used for either arm of the match
        let mut filtered_descendant_hashes = HashSet::new();

        match input.level_query {
            // If we have both types of query, it must mean that this was a recursive call and we need to limit responses to a window of 3 levels
            Some(HierarchyLevelQueryInput {
                orbit_level,
                sphere_hash_b64,
            }) => {
                let lower_bound =
                    orbit_level.expect("Level has been checked higher up the call stack");
                let levels_range: RangeInclusive<i8> = lower_bound..=(lower_bound.clone() + 2);

                insert_descendants(
                    entry_hash.clone().into(),
                    &mut filtered_descendant_hashes,
                    Some(SphereOrbitLevelRange {
                        sphere_entry_hash_b64: sphere_hash_b64
                            .expect("This was validated higher up the call stack"),
                        range: levels_range,
                    }),
                );
            }
            // Otherwise, just return the whole tree (turtles all the way down)
            None => {
                insert_descendants(
                    entry_hash.clone().into(),
                    &mut filtered_descendant_hashes,
                    None,
                );
            }
        }
        let orbit_entry_type: EntryType = UnitEntryTypes::Orbit.try_into()?;
        let filter = ChainQueryFilter::new()
            .entry_hashes(filtered_descendant_hashes)
            .entry_type(orbit_entry_type)
            .include_entries(true);
        let selected_orbits = query(filter)?;

        let maybe_node_hashmap = build_tree(&selected_orbits);
        if let Ok(hashmap) = maybe_node_hashmap {
            Ok(hashmap.get(&entry_hash).unwrap().borrow().to_json())
        } else {
            Err(wasm_error!(WasmErrorInner::Guest(
                "Could not build tree from the given Orbit hash".to_string()
            )))
        }
    // The base of a levels query, which will recursively call and match the arm above
    } else if let Some(HierarchyLevelQueryInput {
        orbit_level,
        sphere_hash_b64,
    }) = input.level_query
    {
        if let Some(hash) = sphere_hash_b64.clone() {
            // we have a sphere hash
            if let Some(level) = orbit_level {
                // and a level to query
                if let Some(links) = orbit_level_links(hash.clone().into(), level)? {
                    // so get the linked orbit entry hashes

                    let target_ehs_mapped_to_trees: Vec<serde_json::Value> =
                        links // and map recursively to get entry hashes
                            .into_iter()
                            .map(|l| {
                                l.target.into_entry_hash().expect(
                                    "This link type will only have entry hashes as a target",
                                )
                            })
                            .map(|eh| {
                                get_orbit_hierarchy_json(OrbitHierarchyInput {
                                    orbit_entry_hash_b64: Some(eh.into()),
                                    level_query: Some(HierarchyLevelQueryInput {
                                        orbit_level,
                                        sphere_hash_b64: Some(hash.clone()),
                                    }),
                                })
                            })
                            .filter_map(Result::ok)
                            .collect();

                    return Ok(serde_json::json!({
                        "level_trees": target_ehs_mapped_to_trees
                    }));
                } else {
                    Err(wasm_error!(WasmErrorInner::Guest(
                        "No Sphere level links could be retrieved".to_string()
                    )))
                }
            } else {
                Err(wasm_error!(WasmErrorInner::Guest(
                    "Must provide a valid Level to query".to_string()
                )))
            }
        } else {
            Err(wasm_error!(WasmErrorInner::Guest(
                "Must provide a Sphere Hash to query".to_string()
            )))
        }
    } else {
        Err(wasm_error!(WasmErrorInner::Guest(
            "Must provide either an Orbit Hash or a Level query".to_string()
        )))
    }
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct HierarchyLevelQueryInput {
    pub orbit_level: Option<i8>,
    pub sphere_hash_b64: Option<EntryHashB64>,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct OrbitHierarchyInput {
    pub orbit_entry_hash_b64: Option<EntryHashB64>,
    pub level_query: Option<HierarchyLevelQueryInput>,
}

/** Private helpers */

struct SphereOrbitLevelRange {
    range: RangeInclusive<i8>,
    sphere_entry_hash_b64: EntryHashB64,
}

fn insert_descendants(
    parent_hash: EntryHash,
    hashes: &mut HashSet<EntryHash>,
    range: Option<SphereOrbitLevelRange>,
) {
    hashes.insert(parent_hash.clone());

    if let Ok(links) = parent_to_child_links(parent_hash) {
        if let Some(links_vec) = links {
            for link in links_vec {
                if let Some(child_hash) = link.target.into_entry_hash() {
                    match range {
                        // If this call needs to be restricted to those descendants linked to a certain level, do that now
                        Some(SphereOrbitLevelRange {
                            ref range,
                            ref sphere_entry_hash_b64,
                        }) => {
                            let include_orbit: bool =
                                does_orbit_have_level_links_within_level_range(
                                    sphere_entry_hash_b64.clone().into(),
                                    range.clone(),
                                    child_hash.clone(),
                                );

                            if include_orbit {
                                if hashes.insert(child_hash.clone()) {
                                    // Only recurse if the child hash was not already present
                                    insert_descendants(
                                        child_hash,
                                        hashes,
                                        Some(SphereOrbitLevelRange {
                                            sphere_entry_hash_b64: sphere_entry_hash_b64.clone(),
                                            range: range.clone(),
                                        }),
                                    );
                                }
                            }
                        }
                        None => {
                            if hashes.insert(child_hash.clone()) {
                                // Only recurse if the child hash was not already present
                                insert_descendants(child_hash, hashes, None);
                            }
                        }
                    }
                }
            }
        }
    }
    println!("Ground control to major Tom...")
}

fn build_tree(
    orbits: &[Record<SignedHashed<hdk::prelude::Action>>],
) -> ExternResult<HashMap<EntryHashB64, Rc<RefCell<Node>>>> {
    let mut nodes: HashMap<EntryHashB64, Rc<RefCell<Node>>> = HashMap::new();
    let mut child_parent_relationships: HashMap<EntryHashB64, EntryHashB64> = HashMap::new();

    // First, create all nodes and track child-parent relationships
    for record in orbits {
        let orbit = entry_from_record::<Orbit>(record.clone())?;
        let entry_hash = hash_entry(orbit.clone())?;
        let entry_hash_b64: EntryHashB64 = entry_hash.clone().into();
        let node = Rc::new(RefCell::new(Node::new(entry_hash_b64.clone(), Vec::new())));

        // Insert the node into the nodes map
        nodes.insert(entry_hash_b64.clone(), node.clone());

        // If the orbit has a parent, remember this relationship to process later
        if let Some(parent_hash) = orbit.parent_hash {
            let parent_hash_b64 = parent_hash.clone().into();
            child_parent_relationships.insert(entry_hash_b64, parent_hash_b64);
        }
    }
    // Now, establish the parent-child relationships
    for (child_hash_b64, parent_hash_b64) in child_parent_relationships {
        if let Some(parent_node_rc) = nodes.get(&parent_hash_b64) {
            if let Some(child_node_rc) = nodes.get(&child_hash_b64) {
                parent_node_rc
                    .borrow_mut()
                    .children
                    .push(child_node_rc.clone());
            }
        }
    }

    Ok(nodes)
}

// Link helpers

fn delete_sphere_hash_link(sphere_hash: EntryHash, target_hash: ActionHash) -> ExternResult<bool> {
    let replaceable_sphere_links: Vec<Vec<Link>> =
        sphere_to_orbit_links(sphere_hash.clone().into())
            .into_iter()
            .filter(|all_sphere_links| {
                all_sphere_links.clone().is_some_and(|l| {
                    l.iter()
                        .find(|l| l.target == target_hash.clone().into())
                        .take()
                        .is_some()
                })
            })
            .map(|maybe_links| maybe_links.unwrap_or_else(Vec::new))
            .collect();

    match replaceable_sphere_links.len() {
        1 => {
            if let Some(target_link) = replaceable_sphere_links[0]
                .iter()
                .find(|&l| l.target == target_hash.clone().into())
                .take()
            {
                delete_link(target_link.create_link_hash.clone())?;
            }
            Ok(true)
        }
        _ => Ok(false),
    }
}

fn orbit_level_links(sphere_hash: EntryHash, level: i8) -> ExternResult<Option<Vec<Link>>> {
    let link_tag_bytes = level.to_ne_bytes().to_vec();
    get_links_from_base(
        sphere_hash,
        LinkTypes::OrbitHierarchyLevel,
        Some(LinkTag(link_tag_bytes)),
    )
}

fn does_orbit_have_level_links_within_level_range(
    sphere_hash: EntryHash,
    range: RangeInclusive<i8>,
    orbit_hash: EntryHash,
) -> bool {
    // Takes a sphere_hash (base), a range (of levels) and an orbit_hash, and determines if the orbit_hash is included in the targets of level links within that range
    for level in range {
        let links = orbit_level_links(sphere_hash.clone(), level.clone());

        if let Ok(Some(links)) = links {
            let targets = links
                .into_iter()
                .map(|l| l.target)
                .collect::<Vec<HoloHash<AnyLinkable>>>();

            if targets.contains(&orbit_hash.clone().into()) {
                return true;
            }
        }
    }
    false
}

fn parent_to_child_links(parent_hash: EntryHash) -> ExternResult<Option<Vec<Link>>> {
    get_links_from_base(parent_hash, LinkTypes::OrbitParentToChild, None)
}
fn _orbit_prefix_path_links(path_hash: EntryHash) -> ExternResult<Option<Vec<Link>>> {
    get_links_from_base(path_hash, LinkTypes::OrbitsPrefixPath, None)
}

fn prefix_path(name: String) -> ExternResult<TypedPath> {
    // convert to lowercase for path for ease of search
    let lower_name = name.to_lowercase();
    let (prefix, _) = lower_name.as_str().split_at(3);

    Path::from(format!("all_orbits.{}", prefix)).typed(LinkTypes::OrbitsPrefixPath)
}
