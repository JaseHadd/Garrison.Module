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
            name: 'Garrison.Settings.Endpoint.Name',
            hint: 'Garrison.Settings.Endpoint.Hint',
            scope: "world",
            config: true,
            type: String,
            default: 'https://garrison.jasehaddleton.io/api',
            onChange: v => console.log(`New Garrison Endpoint chosen: ${v}`)
        });

        game.settings?.register('garrison', 'apiKey', {
            name: 'Garrison.Settings.ApiKey.Name',
            hint: 'Garrison.Settings.ApiKey.Hint',
            scope: 'world',
            config: true,
            type: String,
            default: '',
            onChange: v => console.log(`New API Key: ${v}`)
        });
    }
}