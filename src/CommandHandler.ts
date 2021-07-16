import { Base, Command } from "./Base";
import { readdirSync } from "fs";

export class CommandHandler extends Base {
    public bot: any;
    constructor(bot: any, options: HandlerOptions) {
        super(options);
        this.bot = bot;
        this.load();
    }

    public async interaction(i: any ): Promise<boolean> {
        if(!i.isCommand()) return false;
        const command: Command = this.commands.get(i.commandName) as Command || this.commands.get(i.commandId) as Command;
        if(!command) return this.emit("error", `${i.commandName} not found on my command list!`);

        this.emit("debug", `Running command ${i.commandName}...`);

        this.run(command, this.bot, i)
        return true;
    }

    private async load() {
        for(const file of readdirSync(this.options.commandsDir)) {
            const { command } = require(`${this.options.commandsDir}/${file}`);
            this.add(command);
        }
    }

    public run(command: Command, bot: any, interaction: any): any | void | boolean {
        let cooldownKey = `${command.name}_${interaction.user.id}`;

        if(this.cooldowns.has(cooldownKey)) {
            return interaction.reply({ content: this.options.errorMessages?.cooldown, ephemeral: this.options.errorMessageEph });
        }

        if(command.guildOnly && !interaction.guild) {
            return interaction.reply({ content: this.options.errorMessages?.guildOnly, ephemeral: this.options.errorMessageEph });
        }

        if(command.staffOnly) {
            if(!command.guildOnly) throw new Error("StaffOnly command should be also set to be GuildOnly!");
            if(!interaction.guild) return interaction.reply({content: this.options.errorMessages?.guildOnly, ephemeral: this.options.errorMessageEph});
            interaction.guild.members.fetch(interaction.user.id).then((member: any) => {
                if(!this.options.staffRoles?.includes(member.roles.highest.id)) {
                    return interaction.reply({ content: this.options.errorMessages?.staffOnly, ephemeral: this.options.errorMessageEph })
                }
            });
        }

        if(command.developerOnly) {
            if(this.options.developersIDs?.length !> 0) throw new Error("You should define at least one Developer ID to use DeveloperOnly commands!");
            if(!this.options.developersIDs?.includes(interaction.user.id)) return interaction.reply({ content: this.options.errorMessages?.developerOnly, ephemeral: this.options.errorMessageEph });
        }

        if((command.allowedChannels?.length as number) > 0 || (command.deniedChannels?.length as number) > 0) {
            if(!command.allowedChannels?.includes(interaction.channelId) || command.deniedChannels?.includes(interaction.channelId)) {
                return interaction.reply({ content: this.options.errorMessages?.wrongChannel, ephemeral: true });
            }
        }

        command.execute(bot, interaction);

        this._cooldown(cooldownKey, command.cooldown || 0);

        this.emit("debug", `Command ${command.name} has been ran!`);

        return true;
    }

}

export interface CommandExecute {
    (bot: any, interaction: any): Promise<void | any | undefined | null>;
}

export interface CommandOptions {
    name: string,
    guildOnly?: boolean,
    staffOnly?: boolean,
    developerOnly?: boolean,
    allowedChannels?: Snowflake[],
    deniedChannels?: Snowflake[],
    cooldown?: number,
    ephemeral?: boolean,
    maintence?: boolean,
    execute: CommandExecute,
}

export interface HandlerOptions {
    commandsDir: string,
    errorMessageEph?: boolean,
    staffRoles?: Snowflake[],
    developersIDs?: Snowflake[],
    errorMessages?: {
        cooldown?: string,
        guildOnly?: string,
        staffOnly?: string,
        developerOnly?: string,
        wrongChannel?: string,
    }
}

export type Snowflake = `${bigint}`;