import { id as moduleId } from "../module.json"

type CharacterLike = Actor | string;

export enum ImageType
{
    Token = 'token',
    Portrait = 'portrait'
}

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

    static garrisonId(actor: CharacterLike): string
    {
        if (actor instanceof Actor)
            return (actor as any).getFlag(moduleId, 'garrisonId');
        else
            return actor;
    }

    static imagePath(type: ImageType): string
    {
        return `modules/${moduleId}/storage/${type}s`;
    }

    static async ensureImage(actor: CharacterLike, type: ImageType)
    {
        return FilePicker.browse('data', this.imagePath(type))
            .then(async result => {
                for (const file of result.files)
                {
                    if (file.split('/').at(-1) === `${this.garrisonId(actor)}.webp`)
                        return file;
                }

                return await this.downloadImage(actor, type);
            });
    }

    static async downloadImage(actor: CharacterLike, type: ImageType)
    {
        const endpoint = game.settings?.get('garrison', 'endpoint');
        const apiKey = game.settings?.get('garrison', 'apiKey');
        const headers = {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        };
        
        const garrisonId = this.garrisonId(actor);

        const urlBase = `${endpoint}/character/foundry/${garrisonId}`;

        const target = {
            name: type,
            url: `${urlBase}/${type}`,
            dir: `${type}s`,
            fileName: `${garrisonId}.webp`,
            response: null as (Response | null),
            bytes: null as (ArrayBuffer | null),
            file: null as (File | null)
        }

        return fetch(target.url, { headers: headers })
            .then(
                async r => target.bytes = await r.arrayBuffer(),
                error => { throw new Error(error); })
            .then(_ => target.file = new File([target.bytes!], target.fileName))
            .then(_ => FilePicker.uploadPersistent(moduleId, target.dir, target.file!, {}, { notify: false }))
            .then(_ => `modules/${moduleId}/storage/${target.dir}/${target.fileName}`);
    }
}
