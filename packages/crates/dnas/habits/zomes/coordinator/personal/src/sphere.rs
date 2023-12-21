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
