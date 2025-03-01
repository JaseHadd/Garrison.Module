import { LinkPlayers } from "./apps/link-players";
import { Settings } from "./settings";
import { id as moduleId } from "../module.json"
import { ImageManager } from "./images";

Hooks.on('init', () => {
    console.log('init');

    Settings.registerSettings();
    console.log(game.modules?.get(moduleId));
});

Hooks.on('ready', () => {
    console.log("garrison | ready");
    ImageManager.setup();
});

Hooks.on('changeSidebarTab', tab => {
    // this may only work for Pathfinder – once in testing, work will have to be done for other systems.
    if (!(tab instanceof ActorDirectory))
        return;

    if (document.querySelector('#garrison-link-button') !== null)
        return;

    const partyHeader = document.querySelector('.party-list header');
    const createButton = partyHeader?.querySelector('.create-button');

    if (partyHeader && createButton)
    {
        console.log('Adding party button');
        const linkButton = document.createElement('a');
        const image = linkButton.appendChild(document.createElement('img'));
    
        linkButton.id = 'garrison-link-button';
        linkButton.setAttribute('data-tooltip', 'Link Players to Garrison');
        image.src = `modules/garrison/icons/bounce.png`;

        linkButton.style.maxWidth = '20px';
        linkButton.style.maxHeight = '20px';
        image.style.maxWidth = '20px';
        image.style.maxHeight = '20px';

        $(linkButton).on('click', () => {
            new LinkPlayers({}).render(true);
            return false;
        });
    
        partyHeader.insertBefore(linkButton, createButton);
    }
    else
    {
        console.error('Unable to inject Link button');
    }
});