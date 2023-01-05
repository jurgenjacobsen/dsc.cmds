import { Client, Collection } from 'discord.js';
import { Command } from '../main/Command';

export interface Options {
  bot: Client;
  dir: string;
  clientId?: string;
  clientToken?: string;
  deployCommandsOnLoad?: boolean;
  debug?: boolean;
  errorMessage?: string;
}

export type CommandList = Collection<string, Command>;
