import { Command } from './Command';
import { HandlerOptions } from './Commands';
import { readdirSync } from 'fs';
import { Collection } from 'discord.js';
export class Base {
  public cooldowns: Cooldowns;
  public cache: CommandList;
  public options: HandlerOptions;
  constructor(options: HandlerOptions) {
    this.cache = new Collection();
    this.cooldowns = new Collection();

    this.options = options;

    this.load();
  }

  public debug(...args: any) {
    if (this.options.debug) {
      return console.log(...args);
    }
  }

  public load() {
    this.debug('Loading commands...');
    for (let file of readdirSync(this.options.dir)) {
      let { cmd } = require(`${this.options.dir}/${file}`);
      this.add(new Command(cmd));
    }
  }

  public cooldown(key: string, time: number) {
    if (typeof time !== 'number') throw new Error('Cooldown option should be type number!');
    this.debug(`${time}s cooldown added to ${key}`);
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
      this.debug('Error to load a command...');
      return;
    }
    if (this.cache.get(cmd.id as string) || this.cache.get(cmd.name as string)) {
      this.debug(`${cmd.name} (${cmd.id}) is duplicated!`);
      return;
    }
    if (cmd.id) this.cache.set(cmd.id, cmd);
    else if (cmd.name) this.cache.set(cmd.name, cmd);
    else {
      this.debug(`There's a command without name neither id!`);
      return;
    }
    return cmd;
  }
}

export type CommandList = Collection<string, Command>;
export type Cooldowns = Collection<string, number>;
