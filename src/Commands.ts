import { Client, Interaction, Snowflake } from 'discord.js';
import { Base } from './Base';
export class Commands extends Base {
  constructor(options: HandlerOptions) {
    if (typeof options.bot === 'undefined') throw new Error('A Discord Bot Client should be provided!');
    if (typeof options.dir !== 'string') throw new Error('Commands directory should be a string');

    let opts: HandlerOptions = {
      bot: options.bot,
      dir: options.dir,
      eph: typeof options.eph !== 'boolean' ? false : options.eph,
      devs: Array.isArray(options.devs) || typeof options.devs === 'string' ? (typeof options.devs === 'string' ? [options.devs] : options.devs) : [],
      args: options.args,
      msgs: {
        cooldown: typeof options.msgs?.cooldown !== 'string' ? 'You should wait to use this command again!' : options.msgs.cooldown,
        guildOnly: typeof options.msgs?.guildOnly !== 'string' ? 'This command is only allowed inside guilds!' : options.msgs.guildOnly,
        devOnly: typeof options.msgs?.devOnly !== 'string' ? 'This command is only for developers!' : options.msgs.devOnly,
        channel: typeof options.msgs?.channel !== 'string' ? 'This command is not allowed in this channel!' : options.msgs.channel,
      },
    };

    super(opts);

    this.options.bot.on('interactionCreate', (i) => {
      if (!i.isCommand() && !i.isContextMenu()) return;

      let cmd =
        this.cache.get(i.commandName) ||
        this.cache.get(i.commandId) ||
        this.cache.find((c) => c.id === i.commandId) ||
        this.cache.find((c) => c.name?.toLowerCase() === i.commandName.toLowerCase());

      if (!cmd) {
        this.debug(`Command: ${i.commandName} (${i.commandId}) not found!`);
        return;
      }

      if (i.replied) {
        this.debug(`This interaction was already replied, skipping...`);
        return;
      }

      let ckey = `${i.commandId}_${i.guildId ?? '0'}_${i.user.id}`;

      if (this.cooldowns.has(ckey)) {
        i.reply({ content: this.options.msgs?.cooldown, ephemeral: this.options.eph });
        return;
      }

      if (cmd.context && !i.isContextMenu()) {
        this.debug(`Tried to run command ${i.commandName} but you configured it to be context menu only.`);
        return;
      }

      if (cmd.guildOnly && !i.guildId) {
        i.reply({ content: this.options.msgs?.guildOnly, ephemeral: this.options.eph });
        return;
      }

      if (cmd.devOnly && !this.options.devs?.includes(i.user.id)) {
        i.reply({ content: this.options.msgs?.devOnly, ephemeral: this.options.eph });
        return;
      }

      if (cmd.channels?.allowed && cmd.channels.allowed.length > 0) {
        if (!cmd.channels.allowed?.includes(i.channelId)) {
          i.reply({ content: this.options.msgs?.channel, ephemeral: true });
          return;
        }
      }
      if (cmd.channels?.blocked && cmd.channels.blocked.length > 0) {
        if (cmd.channels.blocked.includes(i.channelId)) {
          i.reply({ content: this.options.msgs?.channel, ephemeral: true });
          return;
        }
      }

      cmd.run(this.options.bot, i, this.options.args);

      this.cooldown(ckey, cmd.cooldown || 0);

      this.debug(`Someone used command: ${i.commandName} (${i.commandId})`);
    });
  }
}

export interface HandlerOptions {
  /** Your bot client */
  bot: Client;
  /** The directory where your commands are located */
  dir: string;
  /** Debug Mode */
  debug?: boolean;
  /** If the command error messages should or not be ephemeral (Only visible for the user) */
  eph?: boolean;
  /** The bot developers' ids for devOnly command (Optional) */
  devs?: Snowflake[];
  /** Arguments that will be received in the command run callback (Optional)*/
  args?: any;
  /** Custom error messages (Optional) */
  msgs?: {
    /** Message that will be sent when a command is under cooldown */
    cooldown?: string;
    /** Message that will be sent when a user tries to use a guildOnly command in DM */
    guildOnly?: string;
    /** Message that will be sent when a user tries to use a devOnly command */
    devOnly?: string;
    /** Message that will be sent when a user tries to use a command in an not allowed channel */
    channel?: string;
  };
}
