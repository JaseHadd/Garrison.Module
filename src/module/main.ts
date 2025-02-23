import { LinkPlayers } from "./apps/link-players";
import { registerSettings } from "./settings";

Hooks.on('init', () => {
    console.log('init');
    registerSettings();
});

Hooks.on("chatMessage", (log, message, data) => {
    if (message === "link")
    {
        const dialog = new LinkPlayers(null);
        dialog.render(true);
    }
})