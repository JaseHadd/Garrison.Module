import { id as moduleId } from "../module.json"

export class ImageManager
{
    static #portraits = 'portraits';
    static #tokens = 'tokens';

    static async #createStorage()
    {
        const base = `modules/${moduleId}/storage`;

        await FilePicker.browse('data', base).catch(async _ => {
            if (!await FilePicker.createDirectory('data', base))
                throw new Error('Could not create storage folder');
        });

        await Promise.all([this.#portraits, this.#tokens])
            .then(async dirs => dirs
                .forEach(async dir => await FilePicker.browse('data', `${base}/${dir}`)
                    .catch(async _ => await FilePicker.createDirectory('data', `${base}/${dir}`))));
    }

    static setup()
    {
        this.#createStorage();
    }

    static async downloadImages(actor: Actor)
    {
        const endpoint = game.settings?.get('garrison', 'endpoint');
        const apiKey = game.settings?.get('garrison', 'apiKey');
        const headers = {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        };
        const garrisonId: string = (actor as any).getFlag('garrison', 'garrisonId');
        const urlBase = `${endpoint}/character/foundry/${garrisonId}`;

        const targets = ['token', 'portrait'].map(s => ({
            name: s,
            url: `${urlBase}/${s}`,
            dir: `${s}s`,
            fileName: `${garrisonId}.webp`,
            response: null as (Response | null),
            bytes: null as (ArrayBuffer | null),
            file: null as (File | null),
            onFinish: (path: string) => actor.update(s === 'portrait' ? { img: path } : { "prototypeToken.texture.src": path })
        }));

        return Promise.all(targets.map(async t => fetch(`${t.url}`, { headers: headers })
                .then(async r => t.bytes = await r.arrayBuffer())
                .then(_ => t.file = new File([t.bytes!], t.fileName))
                .then(_ => FilePicker.uploadPersistent(moduleId, t.dir, t.file!))
                .then(_ => t.onFinish(`modules/${moduleId}/storage/${t.dir}/${t.fileName}`))));
    }
}
