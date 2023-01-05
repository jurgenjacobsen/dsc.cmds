import { Options } from '../utils/types';
import { Base } from './Base';

export class CommandsManager extends Base {
  constructor(options: Options) {
    super(options);

    this.bot.on('interactionCreate', async (interaction) => {
      if (!interaction.isCommand()) return;
      let cmd = this.list.get(interaction.commandName) || this.list.get(interaction.commandId);

      if (!cmd) return this.debug(`Command ${interaction.commandName} not found`);

      if (interaction.replied) return this.debug(`Interaction already replied! Ignoring...`);

      try {
        cmd.execute(this, this.bot, interaction);

        this.debug(`Command ${interaction.commandName} was used!`);
      } catch (error) {
        this.debug(`There was an error on command '${cmd.data.name}'\n`);

        console.error(error);

        await interaction.reply({ content: this.options.errorMessage ?? 'There was an error while executing this command!', ephemeral: true });
      }
    });
  }
}
