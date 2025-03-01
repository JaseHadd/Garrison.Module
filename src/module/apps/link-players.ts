import { MaybePromise, GetDataReturnType } from "fvtt-types/utils";
import { ImageManager } from "../images";

interface PageData
{
    'adventures': Adventure[]
    'chosenAdventure': Adventure | null | undefined
    'users': User[]
}

interface Adventure
{
    'id': number
    'name': string
    'characters': Character[]
}

interface Character
{
    'id': string
    'name': string
    'player': string
    'user': User | undefined
}

interface ActorDocumentData
{
    '_id': string
    'name': string
    'type': 'character'
}


export class LinkPlayers extends Application
{
    data: PageData | undefined;

    static get defaultOptions()
    {
        return foundry.utils.mergeObject(Application.defaultOptions, {
            title: "Garrison.LinkPlayers.Title",
            template: "modules/garrison/templates/apps/link-players.hbs",
            innerWidth: 500,
            innerHeight: 500
        });
    }

    activateListeners(html: JQuery): void {
        super.activateListeners(html);

        html.on('click', '[data-action]', (ev) => this.handleButtonClick(ev))
    }

    async handleButtonClick(event: JQuery.ClickEvent)
    {
        const element = $(event.currentTarget);
        const action: string = element.data('action');

        switch (action) {
        case 'select-adventure':
            const idString = element.parent().find('#garrison-adventure').val()?.toString();
            if (!idString) return;
            const id = parseInt(idString);

            this.data!.chosenAdventure = this.data?.adventures.find(a => a.id === id)
            this.render();
            break;

        case 'select-player':
            const characterId = element.closest('.link-cell').data('character-id');
            const userId = element.closest('.input').find('select').val();
            
            const character = this.data?.chosenAdventure?.characters.find(c => c.id === characterId);
            const user = this.data?.users.find(u => u.id === userId);

            if (character)
                character.user = user;

            this.render();
            break;
        case 'unselect-player':
            const cId = element.closest('.link-cell').data('character-id');
            const c = this.data?.chosenAdventure?.characters.find(c => c.id === cId);
            if(c) c.user = undefined;

            this.render();
            break;
        case 'link':
            await this.linkCharacters().then(actors => actors.forEach(actor => ImageManager.downloadImages(actor)));
            break;
        }
    }

    private async linkCharacters(): Promise<Actor[]>
    {
        const promises: Promise<Actor>[] = [];

        // Okay, this _ONLY_ works for Pf2e, so testing is required for 5e, etc
        const party: any = game.actors?.get('xxxPF2ExPARTYxxx');

        const endpoint = game.settings?.get('garrison', 'endpoint');

        for (const character of this.data?.chosenAdventure?.characters ?? [])
        {
            const data: ActorDocumentData = {
                type: 'character',
                name: character.name,
                _id: character.id
            }

            const url = `${endpoint}/character/foundry/${character.id}/json`;

            promises.push(Promise.all([
                    fetch(url)
                    .then(r => r.json())
                    .then(j => {
                        j.img = "systems/pf2e/icons/default-icons/character.svg"
                        j.prototypeToken.texture.src = "systems/pf2e/icons/default-icons/character.svg";
                        j.flags = j.flags || {}
                        j.flags.garrison = {
                            garrisonId: character.id,
                            lastDownload: new Date()
                        }
                        j.items = j.items.filter((i: any) => i.type !== 'effect');

                        return j;
                    })
                    .then(r => JSON.stringify(r)),
                    Actor.create(data as any)])
                .then(async ([json, actor]) =>
                {
                    const newActor = await (actor as any).importFromJSON(json);
                    (newActor as any).effects?.clear();
                    return newActor as Actor;
                }));
        }

        return Promise.all(promises).then(actors =>
        {
            const system = game.system!.id;
            if (system === 'pf2e')
                (game.actors?.get('xxxPF2ExPARTYxxx') as any).addMembers(...actors);
            party.addMembers(...actors)
            return actors;
        });
    }

    protected async _render(force?: boolean, options?: Application.RenderOptions<FormApplicationOptions> | undefined): Promise<void> {
        return super._render(force, options);
    }

    getData(options?: Partial<FormApplicationOptions> | undefined): MaybePromise<GetDataReturnType<FormApplication.FormApplicationData<FormApplicationOptions, unknown>>>
    {
        if (!this.data) {
            return this.loadDataFromApi().then(d => {
                this.data = {
                    adventures: d,
                    chosenAdventure: null,
                    users: Array.from(game.users!)?.filter(u => u !== game.user) as User[]
                };
                return this.data;
            })
        }
        else
        {
            return this.data;
        }
    }

    async loadDataFromApi(): Promise<Adventure[]>
    {
        const endpoint = game.settings?.get('garrison', 'endpoint');
        const apiKey = game.settings?.get('garrison', 'apiKey');

        if (!endpoint || endpoint.length === 0)
            throw new Error('Endpoint not set. Please set your Garrison endpoint in Settings');
        if (!apiKey || apiKey.length === 0)
            throw new Error('ApiKey not set. Please enter your Garrison Api Key in Settings');

        const adventureUrl = `${endpoint}/user/me/adventures`;
        const headers = {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        };

        let adventures: Adventure[] = await fetch(adventureUrl, { headers: headers })
                .then((response) => response.json())
                .catch((error) => console.error(error));

        return adventures;
    }
}