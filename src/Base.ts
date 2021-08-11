import { Collection } from "discord.js";
import EventEmitter from "events";
import { CommandOptions, HandlerOptions, CommandExecute, Snowflake } from "./Commands";


export class Base extends EventEmitter {
    private _commands: Commands;
    public cooldowns: Cooldowns;
    public options: HandlerOptions;
    constructor(opt: HandlerOptions) {
        super();
        this._commands = new Collection();
        this.cooldowns = new Collection();
        this.options = {
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
    };

    get commands(): Commands {
        return this._commands;
    }

    public add(opt: CommandOptions): Command | boolean {
        let cmd = new Command(opt);
        if(!cmd) return this.emit("debug", "Error while loading command...");
        this.commands.set(cmd.name, cmd);
        return cmd;
    }

    public remove(commandName: string): Command | boolean {
        let cmd = this.commands.get(commandName);
        if(!cmd) return this.emit("debug", "Error while removing a command...");
        this.commands.delete(commandName);
        return cmd;
    }

    public _cooldown(key: string, time: number) {
        if(typeof time !== "number") throw new Error("Cooldown option should be type number!");
        this.emit("debug", `${time}s cooldown added to ${key}`);
        this.cooldowns.set(key, time);
        let i = setInterval(() => {
            if(time !== 0) {
                --time;
                this.cooldowns.set(key, time);
            } else {
                this.cooldowns.delete(key)
                clearInterval(i);
            }
        })
    }

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
    public ctxMenuCommand?: boolean;
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
        this.ctxMenuCommand = typeof options.ctxMenuCommand === "boolean" ? options.ctxMenuCommand : false;
        this.execute = options.execute;
    }
}

export type Cooldowns = Map<string, number>;
export type Commands = Collection<CommandName, Command>;
export type CommandName = string;