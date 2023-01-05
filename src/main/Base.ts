import { Client, Collection, REST, Routes } from 'discord.js';
import { CommandList, Options } from '../utils/types';
import { readdirSync } from 'fs';
import { Command } from './Command';
import path from 'path';

export class Base {
  public bot: Client;
  public options: Options;
  public list: CommandList;
  public raw: any[];

  constructor(options: Options) {
    this.options = options;
    this.bot = options.bot;

    this.list = new Collection();
    this.raw = [];

    this.load();
  }

  public debug(str: string): void {
    if (this.options.debug) console.log('[DSC.CMDS | DEBUG] ' + str);
  }

  public async load() {
    this.debug('Loading commands');

    const commandsPath = this.options.dir;
    const files = readdirSync(commandsPath).filter((file) => file.endsWith('.js') || file.endsWith('.ts'));

    for (const file of files) {
      const filePath = path.join(commandsPath, file);
      let command = require(filePath);

      command = command?.default || command?.command || command?.cmd || command;

      if (command && 'data' in command && 'execute' in command) {
        this.add(command);
        this.raw.push(command.data.toJSON());
      } else {
        this.debug(`Command ${file} should have a 'data' and 'execute' properties!`);
      }
    }

    if (this.options.deployCommandsOnLoad && this.raw) {
      this.debug(`'Deploy Command on Load' options is activated, deploying...`);

      if (typeof this.options?.clientId !== 'string') throw "To deploy commands through the manager you need to input your bot's clientId on the manager options";
      if (typeof this.options?.clientToken !== 'string') throw "To deploy commands through the manager you need to input your bot's clientToken on the manager options";

      const rest = new REST({ version: '10' }).setToken(this.options.clientToken);

      try {
        this.debug(`Started refreshing ${this.raw.length} application (/) commands.`);

        const data: any = await rest.put(Routes.applicationCommands(this.options.clientId), { body: this.raw });

        this.debug(`Successfully reloaded ${data.length} application (/) commands.`);
      } catch (error) {
        console.error(error);
      }
    }

    this.debug(`Loaded ${this.list.size} commands`);
  }

  public add(cmd: Command): Command | void {
    if (!cmd) {
      this.debug('Command not inputed, error');
      return;
    }

    if (this.list.get(cmd.data.name)) {
      this.debug(`${cmd.data.name} is duplicated or has a duplicated name!`);
      return;
    }

    this.list.set(cmd.data.name, cmd);

    return cmd;
  }
}
