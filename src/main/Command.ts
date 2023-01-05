import { Client, CommandInteraction } from 'discord.js';
import { CommandsManager } from './CommandsManager';
import { SlashCommandBuilder } from '@discordjs/builders';

export class Command {
  public data: SlashCommandBuilder;
  public execute: CommandRun;
  constructor(payload: CommandOptions) {
    this.data = payload.data;
    this.execute = payload.execute;
  }
}

export interface CommandRun {
  (cm: CommandsManager, bot: Client, interaction: CommandInteraction): Promise<any> | any;
}

export interface CommandOptions {
  data: SlashCommandBuilder;
  execute: CommandRun;
}
