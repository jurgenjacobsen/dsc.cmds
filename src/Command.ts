import { CommandInteraction, ContextMenuInteraction, Snowflake } from 'discord.js';

export class Command {
  public name?: string;
  public id?: string;
  public guildOnly?: boolean;
  public devOnly?: boolean;
  public context?: boolean;
  public cooldown?: number;
  public channels?: {
    allowed?: Snowflake[];
    blocked?: Snowflake[];
  };
  public run: CommandRun;
  constructor(payload: CommandOptions) {
    if (typeof payload.name === 'string') {
      this.name = payload.name;
    }
    if (typeof payload.id === 'string') {
      this.id = payload.id;
    }

    if (typeof payload.run !== 'function') {
      throw new Error('Run property should be a function');
    }

    this.guildOnly = typeof payload.guildOnly !== 'boolean' ? false : payload.guildOnly;
    this.devOnly = typeof payload.devOnly !== 'boolean' ? false : payload.devOnly;
    this.context = typeof payload.context !== 'boolean' ? false : payload.context;
    this.cooldown = payload.cooldown ?? 0;

    if (typeof payload.channels === 'object') {
      this.channels = {
        allowed: Array.isArray(payload.channels.allowed) ? payload.channels.allowed : [],
        blocked: Array.isArray(payload.channels.blocked) ? payload.channels.blocked : [],
      };
    } else {
      this.channels = {
        allowed: [],
        blocked: [],
      };
    }

    this.run = payload.run;
  }
}

export interface CommandRun {
  (bot: any, interaction: CommandInteraction | ContextMenuInteraction, ...args: any): Promise<any> | any;
}

interface _CommandOptions {
  guildOnly?: boolean;
  devOnly?: boolean;
  cooldown?: number;
  context?: boolean;
  channels?: {
    allowed?: Snowflake[];
    blocked?: Snowflake[];
  };
  run: CommandRun;
}

export interface CommandOptions extends _CommandOptions {
  name?: string;
}

export interface CommandOptions extends _CommandOptions {
  id?: string;
}
