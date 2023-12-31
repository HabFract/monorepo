use hdk::prelude::*;

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
