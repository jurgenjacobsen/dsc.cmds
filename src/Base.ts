import { Collection, Interaction } from 'discord.js';
import { EventEmitter } from 'events';
import { Command } from './Command';
import { HandlerOptions } from './Commands';
import { readdirSync } from 'fs';
export class Base extends EventEmitter {
  private _commands: CommandList;
  public cooldowns: Cooldowns;
  public options: HandlerOptions;
  constructor(options: HandlerOptions) {
    super();

    this._commands = new Collection();
    this.cooldowns = new Collection();

    this.options = options;

    this.load();
  }

  public get commands(): CommandList {
    return this._commands;
  }

  public load() {
    this.emit('debug', 'Loading commands...');
    for (let file of readdirSync(this.options.dir)) {
      let { cmd } = require(`${this.options.dir}/${file}`);
      this.add(new Command(cmd));
    }
  }

  public cooldown(key: string, time: number) {
    if (typeof time !== 'number') throw new Error('Cooldown option should be type number!');
    this.emit('debug', `${time}s cooldown added to ${key}`);
    this.cooldowns.set(key, time);
    let i = setInterval(() => {
      if (time !== 0) {
        --time;
        this.cooldowns.set(key, time);
      } else {
        this.cooldowns.delete(key);
        clearInterval(i);
      }
    });
  }

  public add(cmd: Command): Command | void {
    if (!cmd) {
      this.emit('debug', 'Error to load a command...');
      return;
    }
    if (this.commands.get(cmd.id as string) || this.commands.get(cmd.name as string)) {
      this.emit('debug', `${cmd.name} (${cmd.id}) is duplicated!`);
      return;
    }
    if (cmd.id) this.commands.set(cmd.id, cmd);
    else if (cmd.name) this.commands.set(cmd.name, cmd);
    else {
      this.emit('debug', `There's a command without name neither id!`);
      return;
    }
    return cmd;
  }
}

export type CommandList = Collection<string, Command>;
export type Cooldowns = Collection<string, number>;
