import { Client, Collection, CommandInteraction, Snowflake } from "discord.js";
import EventEmitter from "events";

export class Base extends EventEmitter {
    private _commands: Commands;
    private _cooldowns: Cooldowns;
    public options: HandlerOptions;
    constructor(opt: HandlerOptions) {
        super();
        this._commands = new Collection();
        this._cooldowns = new Collection();
        this.options = {
            commandsDir: opt.commandsDir,
            errorMessageEph: typeof opt.errorMessageEph === "boolean" ? opt.errorMessageEph : false,
            staffRoles: Array.isArray(opt.staffRoles) ? opt.staffRoles : [],
            developersIDs: Array.isArray(opt.developersIDs) ? opt.developersIDs : [],
            errorMessages: {
                cooldown: (opt.errorMessages?.cooldown?.length as number) > 1 ? opt.errorMessages?.cooldown : `You should wait to use this command again!`,
                guildOnly: (opt.errorMessages?.guildOnly?.length as number) > 1 ? opt.errorMessages?.guildOnly : `This command is only allowed inside guilds!`,
                staffOnly: (opt.errorMessages?.staffOnly?.length as number) > 1 ? opt.errorMessages?.staffOnly : `This command is only for staff!`,
                developerOnly: (opt.errorMessages?.developerOnly?.length as number) > 1 ? opt.errorMessages?.developerOnly : `This command is only for my developers!`,
                wrongChannel: (opt.errorMessages?.wrongChannel?.length as number) > 1 ? opt.errorMessages?.wrongChannel : `You're on the wrong channel to use this command!`,
            }
        };

        this.on("command", (cmd, bot, i) => {
            this._runCommand(cmd, bot, i);
        });
    }

    get commands(): Commands {
        return this._commands;
    }

    public async add(opt: CommandOptions): Promise<Command | boolean> {
        let cmd = new Command(opt);
        if(!cmd) return this.emit("debug", "Error while loading command...");
        this.commands.set(cmd.name, cmd);
        return cmd;
    }

    public async remove(commandName: string): Promise<Command | boolean> {
        let cmd = this.commands.get(commandName);
        if(!cmd) return this.emit("debug", "Error while removing a command...");
        this.commands.delete(commandName);
        return cmd;
    }

    public run(command: Command, bot: Client | any, interaction: CommandInteraction) {
        try {
            this._runCommand(command, bot, interaction);
            return true;
        } catch(err) {
            this.emit("debug", `A error ocurred on the command ${command.name}`);
            throw new Error(err);
        }
    }

    private async _runCommand(command: Command, bot: Client | any, interaction: CommandInteraction): Promise<any | void | boolean> {
        let cooldownKey = `${command.name}_${interaction.user.id}`;

        if(this._cooldowns.has(cooldownKey)) {
            return interaction.reply({ content: this.options.errorMessages?.cooldown, ephemeral: this.options.errorMessageEph });
        }

        if(command.guildOnly && !interaction.guild) {
            return interaction.reply({ content: this.options.errorMessages?.guildOnly, ephemeral: this.options.errorMessageEph });
        }

        if(command.staffOnly) {
            if(!command.guildOnly) throw new Error("StaffOnly command should be also set to be GuildOnly!");
            if(!interaction.guild) return interaction.reply({content: this.options.errorMessages?.guildOnly, ephemeral: this.options.errorMessageEph});
            let member = await interaction.guild.members.fetch(interaction.user.id);
            if(!this.options.staffRoles?.includes(member.roles.highest.id)) {
                return interaction.reply({ content: this.options.errorMessages?.staffOnly, ephemeral: this.options.errorMessageEph })
            }
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

        interaction.defer({ephemeral: command.ephemeral});
        command.execute(bot, interaction);

        this._cooldown(cooldownKey, command.cooldown || 0);

        this.emit("debug", `Command ${command.name} has been ran!`);

        return true;
    }

    private _cooldown(key: string, time: number) {
        if(typeof time !== "number") throw new Error("Cooldown option should be type number!");
        this.emit("debug", `${time}s cooldown added to ${key}`);
        this._cooldowns.set(key, time);
        let i = setInterval(() => {
            if(time !== 0) {
                --time;
                this._cooldowns.set(key, time);
            } else {
                this._cooldowns.delete(key)
                clearInterval(i);
            }
        })
    }

    /**
     * Emitted on debug mode
     * @event Base#debug
     * @param {string} Message Debug message
     * @example <Handler>.on("debug", console.log)
     */

    /**
     * Emitted the handler encounters errors
     * @event Base#error
     * @param {string} Message Error message
     * @example <Handler>.on("error", console.error)
     */

}

export class Command {
    public name: string;
    public guildOnly?: boolean;
    public staffOnly?: boolean;
    public developerOnly?: boolean;
    public allowedChannels?: Snowflake[];
    public deniedChannels?: Snowflake[];
    public cooldown?: number;
    public ephemeral?: boolean;
    public maintence?: boolean;
    public execute: CommandExecute;
    constructor(options: CommandOptions) {
        if(typeof options.name !== "string") throw new Error(`Command name should but type string, received: ${typeof options.name}`);
        if(typeof options.execute !== "function") throw new Error(`Command "execute" option should be an function, received: ${typeof options.execute}`);
        this.name = options.name;
        this.guildOnly = typeof options.guildOnly === "boolean" ? options.guildOnly : false;
        this.staffOnly = typeof options.staffOnly === "boolean" ? options.staffOnly : false;
        this.developerOnly = typeof options.developerOnly === "boolean" ? options.developerOnly : false;
        this.allowedChannels = Array.isArray(options.allowedChannels) ? options.allowedChannels : [];
        this.deniedChannels = Array.isArray(options.deniedChannels) ? options.deniedChannels : [];
        this.cooldown = typeof options.cooldown === "number" ? options.cooldown : 0;
        this.ephemeral = typeof options.ephemeral === "boolean" ? options.ephemeral : false;
        this.maintence = typeof options.maintence === "boolean" ? options.maintence : false;
        this.execute = options.execute;
    }
}

export type Cooldowns = Collection<string, number>;
export type Commands = Collection<CommandName, Command>;
export type CommandName = string;

export interface CommandExecute {
    (bot: Client | any, interaction: CommandInteraction): Promise<void | any | undefined | null>;
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
