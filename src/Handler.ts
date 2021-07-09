import { Client, Interaction } from "discord.js";
import { Base, Command, HandlerOptions } from "./Base";
import { readdirSync } from "fs";

export class Handler extends Base {
    public bot: Client | any;
    constructor(bot: Client | any, options: HandlerOptions) {
        super(options);
    }

    public async interaction(i: Interaction): Promise<boolean> {
        if(!i.isCommand()) return false;
        const command: Command = this.commands.get(i.commandName) as Command || this.commands.get(i.commandId) as Command;
        if(!command) return this.emit("error", `${i.commandName} not found on my command list!`);

        this.emit("debug", `Running command ${i.commandName}...`);

        this.run(command, this.bot, i)
        return true;
    }

    public async load() {
        for(const file of readdirSync(this.options.commandsDir)) {
            const { command } = require(`${this.options.commandsDir}/${file}`);
            this.add(command);
        }
    }

}