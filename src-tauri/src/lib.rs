use holochain_types::prelude::AppBundle;
use lair_keystore::dependencies::sodoken::{BufRead, BufWrite};
use std::collections::HashMap;
use std::path::PathBuf;
use tauri_plugin_holochain::{HolochainPluginConfig, HolochainExt};
use url2::Url2;
    
use tauri::{AppHandle, Listener};

const APP_ID: &'static str = "habit_fract";
const PRODUCTION_SIGNAL_URL: &'static str = "wss://signal.holo.host";
const PRODUCTION_BOOTSTRAP_URL: &'static str = "https://bootstrap.holo.host";

pub fn happ_bundle() -> AppBundle {
    let bytes = include_bytes!("../../workdir/habit_fract.happ");
    AppBundle::decode(bytes).expect("Failed to decode habit_fract happ")
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut context = tauri::generate_context!();
    if tauri::is_dev() {
        let identifier = context.config().identifier.clone();
        context.config_mut().identifier = format!("{}{}", identifier, uuid::Uuid::new_v4());
    }
    
    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::default()
                .level(log::LevelFilter::Warn)
                .build(),
        )
        .plugin(tauri_plugin_holochain::async_init(
            vec_to_locked(vec![]).expect("Can't build passphrase"),
            HolochainPluginConfig {
                signal_url: signal_url(),
                bootstrap_url: bootstrap_url(),
                holochain_dir: holochain_dir(),
            },
        ))
        .setup(|app| {
            #[cfg(desktop)]
            app.handle()
            .plugin(tauri_plugin_updater::Builder::new().build())?;

            let handle = app.handle().clone();
            app.handle().listen("holochain-setup-completed", move |_event| {
                let handle = handle.clone();
                tauri::async_runtime::spawn(async move {
                    setup(handle.clone()).await.expect("Failed to setup");

                    handle
                        .holochain()
                        .expect("Failed to get holochain")
                        .main_window_builder(String::from("main"), false, Some(APP_ID.into()), None).await
                        .expect("Failed to build window")
                        .build()
                        .expect("Failed to open main window");
                });
            });

            Ok(())
        })
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_process::init())
        .run(context)
        .expect("error while running tauri application");
}

// Very simple setup for now:
// - On app start, list installed apps:
//   - If there are no apps installed, this is the first time the app is opened: install our hApp
//   - If there **are** apps:
//     - Check if it's necessary to update the coordinators for our hApp
//       - And do so if it is
//
// You can modify this function to suit your needs if they become more complex
async fn setup(handle: AppHandle) -> anyhow::Result<()> {
    let admin_ws = handle.holochain()?.admin_websocket().await?;

    let installed_apps = admin_ws
        .list_apps(None)
        .await
        .map_err(|err| tauri_plugin_holochain::Error::ConductorApiError(err))?;

    if installed_apps.len() == 0 {
        handle
            .holochain()?
            .install_app(
                String::from(APP_ID),
                happ_bundle(),
                HashMap::new(),
                None,
                None,
            )
            .await?;

        Ok(())
    } else {
        handle.holochain()?.update_app_if_necessary(
            String::from(APP_ID),
            happ_bundle()
        ).await?;

        Ok(())
    }
}

fn internal_ip() -> String {
    std::option_env!("INTERNAL_IP")
        .expect("Environment variable INTERNAL_IP was not set")
        .to_string()
}

fn bootstrap_url() -> Url2 {
    // Resolved at compile time to be able to point to local services
    if tauri::is_dev() {
        let internal_ip = internal_ip();
        let port = std::option_env!("BOOTSTRAP_PORT")
            .expect("Environment variable BOOTSTRAP_PORT was not set");
        url2::url2!("http://{internal_ip}:{port}")
    } else {
        url2::url2!("{}", PRODUCTION_BOOTSTRAP_URL)
    }
}

fn signal_url() -> Url2 {
    // Resolved at compile time to be able to point to local services
    if tauri::is_dev() {
        let internal_ip = internal_ip();
        let signal_port =
            std::option_env!("SIGNAL_PORT").expect("Environment variable INTERNAL_IP was not set");
        url2::url2!("ws://{internal_ip}:{signal_port}")
    } else {
        url2::url2!("{}", PRODUCTION_SIGNAL_URL)
    }
}

fn holochain_dir() -> PathBuf {
    if tauri::is_dev() {
        let tmp_dir = tempdir::TempDir::new("habit_fract").expect("Could not create temporary directory");

        // Convert `tmp_dir` into a `Path`, destroying the `TempDir`
        // without deleting the directory.
        let tmp_path = tmp_dir.into_path();
        tmp_path
    } else {
        app_dirs2::app_root(
            app_dirs2::AppDataType::UserData,
            &app_dirs2::AppInfo {
                name: "habit_fract",
                author: std::env!("CARGO_PKG_AUTHORS"),
            },
        )
        .expect("Could not get app root")
        .join("holochain")
    }
}

fn vec_to_locked(mut pass_tmp: Vec<u8>) -> std::io::Result<BufRead> {
    match BufWrite::new_mem_locked(pass_tmp.len()) {
        Err(e) => {
            pass_tmp.fill(0);
            Err(e.into())
        }
        Ok(p) => {
            {
                let mut lock = p.write_lock();
                lock.copy_from_slice(&pass_tmp);
                pass_tmp.fill(0);
            }
            Ok(p.to_read())
        }
    }
}
