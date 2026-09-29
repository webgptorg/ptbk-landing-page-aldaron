[ ]

[✨🚞] When something fails in the recording studio, the user should be immediately notified and aware.

- The user should see a clear error message indicating what went wrong.
- User can be out of the focus of the recording studio browser tab, so the notification should be pushed as a browser notification and sound alert
- Allow to test this alert
- This alert should also occur when the browser runs out of space or for any reason, the recording stopped or crashed.
- But in the first place, try to keep recording.
- For example "Zdroj „App“ byl odpojen. Všechny stopy byly zastaveny." Should not crash the entire recording, just stop the affected tracks and allow the user to continue recording.
- But trigger the alert whenever a failure occurs, even if it doesn't stop the entire recording.
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do a analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](./changelog/_current-preversion.md)

![alt text](prompts/screenshots/2026-09-0910-recording-studio-fail.png)
