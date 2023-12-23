use hdk::prelude::*;
use personal_integrity::*;

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
pub fn get_sphere(original_sphere_hash: ActionHash) -> ExternResult<Option<Record>> {
    let links = get_links(original_sphere_hash.clone(), LinkTypes::SphereUpdates, None)?;
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
pub struct UpdateSphereInput {
    pub original_sphere_hash: ActionHash,
    pub previous_sphere_hash: ActionHash,
    pub updated_sphere: Sphere,
}
#[hdk_extern]
pub fn update_sphere(input: UpdateSphereInput) -> ExternResult<Record> {
    let updated_sphere_hash = update_entry(
        input.previous_sphere_hash.clone(),
        &input.updated_sphere,
    )?;
    create_link(
        input.original_sphere_hash.clone(),
        updated_sphere_hash.clone(),
        LinkTypes::SphereUpdates,
        (),
    )?;
    let record = get(updated_sphere_hash.clone(), GetOptions::default())?
        .ok_or(
            wasm_error!(
                WasmErrorInner::Guest(String::from("Could not find the newly updated Sphere"))
            ),
        )?;
    Ok(record)
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
    debug!(
        "_+_+_+_+_+_+_+_+_+_ Created My Sphere: {:#?}",
        record.clone()
    );
    Ok(record)
}

#[hdk_extern]
pub fn get_all_my_spheres(_:()) -> ExternResult<Vec<Record>> {
    let sphere_entry_type: EntryType = UnitEntryTypes::Sphere.try_into()?; 
    let filter = ChainQueryFilter::new().entry_type(sphere_entry_type); 

    let all_my_spheres = query(filter)?; 

    debug!(
        "_+_+_+_+_+_+_+_+_+_ All Spheres from my source chain: {:#?}",
        all_my_spheres.clone()
    );
    Ok(all_my_spheres)
}


/** Private helpers */

fn _agent_to_sphere_links() -> ExternResult<Option<Vec<Link>>> {
    let agent_address = agent_info()?.agent_initial_pubkey.clone();
    let links = get_links(agent_address, LinkTypes::AgentToSphere, None)?;
    debug!("---- LINKS ---- {:#?}", links);
    if links.len() == 0 {
        return Ok(None);
    }
    Ok(Some(links))
}

fn _prefix_path(name: String) -> ExternResult<TypedPath> {
    // convert to lowercase for path for ease of search
    let lower_name = name.to_lowercase();
    let (prefix, _) = lower_name.as_str().split_at(3);

    Path::from(format!("all_spheres.{}", prefix)).typed(LinkTypes::SpheresPrefixPath)
}

fn get_latest(action_hash: ActionHash) -> ExternResult<Record> {
    let details = get_details(action_hash, GetOptions::default())?.ok_or(wasm_error!(
        WasmErrorInner::Guest("Sphere not found".into())
    ))?;

    match details {
        Details::Entry(_) => Err(wasm_error!(WasmErrorInner::Guest(
            "Malformed details".into()
        ))),
        Details::Record(element_details) => match element_details.updates.last() {
            Some(update) => get_latest(update.action_address().clone()),
            None => Ok(element_details.record),
        },
    }
}
