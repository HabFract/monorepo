import { ask } from "@tauri-apps/plugin-dialog";
import { relaunch } from "@tauri-apps/plugin-process";
import { check } from "@tauri-apps/plugin-updater";

export async function checkForAppUpdates(onUserClick: false) {
  const update = await check();
  console.log('Checked for update :>> ', update);
  if (!update) {
			return;
		} else if (update?.available) {
      const yes = await ask(`Update to ${update.version} is available!\n\nRelease notes: ${update.body}`, { 
        title: 'Update Available',
        kind: 'info',
        okLabel: 'Update',
        cancelLabel: 'Cancel'
      });
      if (yes) {
        await update.downloadAndInstall();
        await relaunch();
      }
    }
}
