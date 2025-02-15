import { LinkPlayers } from "./apps/link-players";

Hooks.on('init', () => {
    console.log('init');
});

Hooks.on("chatMessage", (log, message, data) => {
    if (message === "link")
    {
        const dialog = new LinkPlayers(null);
        dialog.render(true);
    }
})