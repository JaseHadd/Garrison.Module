export class LinkPlayers extends FormApplication
{
    static get defaultOptions()
    {
        return foundry.utils.mergeObject(FormApplication.defaultOptions, {
            title: "Pf2eGarrison.LinkPlayers.Title",
            template: "modules/pf2e-garrison/templates/apps/link-players.hbs",
            innerWidth: 400,
            innerHeight: "auto"
        });
    }

    /** @inheritdoc */
    async _updateObject(event: Event, formData?: object): Promise<void> {
        console.log(formData);
        console.log(event);
    }
    
}