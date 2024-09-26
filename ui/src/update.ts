import { message, ask } from "@tauri-apps/plugin-dialog";
import { relaunch } from "@tauri-apps/plugin-process";
import { check } from "@tauri-apps/plugin-updater";

export async function checkForAppUpdates(onUserClick: boolean = false) {
  const update = await check();
  console.log('Checked for update :>> ', update);
  if (!update) {
			message('No updates available')
		} else if (update?.available) {
      const yes = await ask(`Update to ${update.version} is available!\n\nRelease notes: ${update.body}`, { 
        title: 'Update Available',
        kind: 'info',
        okLabel: 'Update',
        cancelLabel: 'Cancel'
      });
      if (yes) {
        message('Update will download in the background... as you were!')
        await update.downloadAndInstall();
        const restart = await ask(`Note: AppImage users will need to re-set the .AppImage as executable after this, and then re-run the file manually. MacOS users may need to move the program into the Applications folder if this update doesn't work, then re-run the update. Debian users may need to set write-access to successfully update.`, { 
          title: 'Update complete! Restart now?',
          kind: 'info',
          okLabel: 'Restart',
          cancelLabel: 'Cancel'
        });
        restart && await relaunch();
      }
    }
}
