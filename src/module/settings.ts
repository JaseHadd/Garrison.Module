declare global {
    interface SettingConfig {
        'garrison.apiKey': string;
    }
}

function registerSettings()
{
    game.settings?.register('garrison', 'apiKey', {
        name: 'API Key',
        hint: 'Your API key, obtained from https://garrison.jasehaddleton.io/',
        scope: 'world',
        config: true,
        type: String,
        default: '',
        onChange: v => console.log(`New API Key: ${v}`)
    });
}

export {
    registerSettings
};