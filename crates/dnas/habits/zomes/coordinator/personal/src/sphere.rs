use hdk::prelude::*;
use personal_integrity::*;

use crate::utils::{get_links_from_base, sphere_to_orbit_links};

#[hdk_extern]
pub fn create_sphere(sphere: Sphere) -> ExternResult<Record> {
    let sphere_hash = create_entry(&EntryTypes::Sphere(sphere.clone()))?;
    let record = get(sphere_hash.clone(), GetOptions::default())?
        .ok_or(
            wasm_error!(
                WasmErrorInner::Guest(String::from("Could not find the newly created Sphere"))
            ),
        )?;
    Ok(record)
}


#[hdk_extern]
pub fn get_my_sphere(original_sphere_hash: ActionHash) -> ExternResult<Option<Record>> {
    get_latest(original_sphere_hash)
}

#[hdk_extern]
pub fn get_sphere(original_sphere_hash: ActionHash) -> ExternResult<Option<Record>> {
    let links = get_links(
            GetLinksInputBuilder::try_new(original_sphere_hash.clone(), LinkTypes::SphereUpdates)?
                .build()
            )?;
    let latest_link = links
        .into_iter()
        .max_by(|link_a, link_b| link_a.timestamp.cmp(&link_b.timestamp));
    let latest_sphere_hash = match latest_link {
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
        None => original_sphere_hash.clone(),
    };
    get(latest_sphere_hash, GetOptions::default())
}

#[derive(Serialize, Deserialize, Debug)]

#[serde(rename_all = "camelCase")]
pub struct UpdateSphereInput {
    pub original_sphere_hash: ActionHash,
    pub updated_sphere: Sphere,
}

#[hdk_extern]
pub fn update_sphere(input: UpdateSphereInput) -> ExternResult<Option<Record>> {
    let updated_sphere_hash = update_entry(input.original_sphere_hash.clone(), &input.updated_sphere)?;

    let path = all_spheres_anchor()?;
    path.ensure()?;

    // let _link_deleted = delete_sphere_hash_link(
    //     input.updated_sphere.sphere_hash.clone().into(),
    //     input.original_sphere_hash.clone(),
    // )?; TODO: need to delete and replace all old sphere orbit links?

    // // Create sphere link to updated header
    // create_link(
    //     input.updated_sphere.sphere_hash.clone(), // Assume the Sphere cannot be change and validation will be added to ensure this
    //     updated_sphere_hash.clone(),
    //     LinkTypes::SphereToOrbit,
    //     (),
    // )?;

    // Create anchor link to updated header
    create_link(
        path.path_entry_hash()?,
        updated_sphere_hash.clone(),
        LinkTypes::SpheresAnchor,
        input.updated_sphere.name.as_bytes().to_vec(),
    )?;

    get_latest(updated_sphere_hash.clone())
}

#[hdk_extern]
pub fn delete_sphere(original_sphere_hash: ActionHash) -> ExternResult<ActionHash> {
    delete_entry(original_sphere_hash)
}

#[hdk_extern]
pub fn create_my_sphere(sphere: Sphere) -> ExternResult<Record> {
    let sphere_hash = create_entry(&EntryTypes::Sphere(sphere.clone()))?;
    let record = get(sphere_hash.clone(), GetOptions::default())?
        .ok_or(
            wasm_error!(
                WasmErrorInner::Guest(String::from("Could not find the newly created Sphere"))
            ),
        )?;

    let path = all_spheres_anchor()?;
    path.ensure()?;
    
    // Create anchor link to new header
    create_link(
        path.path_entry_hash()?,
        sphere_hash.clone(),
        LinkTypes::SpheresAnchor,
        (),
    )?;

    Ok(record)
}

#[hdk_extern]
pub fn _get_all_my_historic_spheres(_:()) -> ExternResult<Vec<Record>> {
    let sphere_entry_type: EntryType = UnitEntryTypes::Sphere.try_into()?; 
    let filter = ChainQueryFilter::new().entry_type(sphere_entry_type).include_entries(true); 

    let all_my_spheres = query(filter)?; 

    // debug!(
    //     "_+_+_+_+_+_+_+_+_+_ All Spheres from my source chain: {:#?}",
    //     all_my_spheres.clone()
    // );
    Ok(all_my_spheres)
}

#[hdk_extern]
pub fn get_all_my_spheres(_ : ()) -> ExternResult<Vec<Record>> {
    let path = all_spheres_anchor()?;
    path.ensure()?;
    let maybe_links = sphere_prefix_path_links(path.path_entry_hash().expect("This will be an entry hash").into())?;

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
        let my_spheres = query(filter)?;
        return Ok(my_spheres);
    }
    Ok(vec![])
}

/** Private helpers */

fn _agent_to_sphere_links() -> ExternResult<Option<Vec<Link>>> {
    let agent_address = agent_info()?.agent_initial_pubkey.clone();
    let links = get_links(
        GetLinksInputBuilder::try_new(agent_address.clone(), LinkTypes::AgentToSphere)?
            .build()
        )?;
    if links.len() == 0 {
        return Ok(None);
    }
    Ok(Some(links))
}

fn get_latest(action_hash: ActionHash) -> ExternResult<Option<Record>> {
    let details = get_details(action_hash, GetOptions::default())?.ok_or(wasm_error!(
        WasmErrorInner::Guest("Sphere not found".into())
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

fn sphere_prefix_path_links(path_hash: EntryHash) -> ExternResult<Option<Vec<Link>>> {
    get_links_from_base(path_hash, LinkTypes::SpheresAnchor, None)
}

fn _delete_sphere_hash_link(sphere_hash: EntryHash, target_hash: ActionHash) -> ExternResult<bool> {
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


fn all_spheres_anchor() -> ExternResult<TypedPath> {
    Path::from(format!("all_spheres")).typed(LinkTypes::SpheresAnchor)
}
