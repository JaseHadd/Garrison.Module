declare global {
    interface SettingConfig {
        'garrison.apiKey': string;
        'garrison.endpoint': string;
    }
}

export class Settings 
{
    static registerSettings(): void
    {
        game.settings?.register('garrison', 'endpoint', {
            name: 'Endpoint',
            hint: "The Garrison endpoint to use. Only change this if you know what you're doing",
            scope: "world",
            config: true,
            type: String,
            default: 'https://garrison.jasehaddleton.io/api',
            onChange: v => console.log(`New Garrison Endpoint chosen: ${v}`)
        });

        game.settings?.register('garrison', 'apiKey', {
            name: 'API Key',
            hint: 'Your API key, obtained from your Garrison server, do NOT share this.',
            scope: 'world',
            config: true,
            type: String,
            default: '',
            onChange: v => console.log(`New API Key: ${v}`)
        });
    }
}