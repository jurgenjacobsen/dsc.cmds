# dsc.cmds
A simple and easy to use Discord.js slash command handler.

`npm i dsc.cmds`

> **DISCLAIMER** *This will only work with discord.js version 13.0 or later*

### Example
Here's two examples of how you can use the Handler one in Javascript and one 'advanced' in Typescript.

#### Javascript
```js
    const { Handler } = require("dsc.cmds");
    const { Client } = require("discord.js");
    const path = require("path");

    const bot = new Client();
    const handler = new Handler(bot, {
        commandsDir: path.join(__dirname, "./commands") // The directory where the commands are located
        staffRoles: ["123456789012345678"] // The roles for the 'staffOnly' option on the commands
        developersIDs: ["123456789012345678"] // The IDs for the 'developerOnly' option on the commands
        errorMessageEph: false, // If the error messages should be ephemeral or not
        errorMessages: { // Here you customize the error messages
            cooldown: `You should wait to use this command again!`,
            guildOnly: `This command is only allowed inside guilds!`,
            staffOnly: `This command is only for staff!`,
            developerOnly: `This command is only for my developers!`,
            wrongChannel: `You're on the wrong channel to use this command!`,
        }
    });

    bot.on("interactionCreate", (i) => handler.interaction(i));
    bot.on("ready", () => console.log("Ready!"));

    bot.login("TOKEN");

```

#### Typescript
```ts
    import { Handler } from "dsc.cmds";
    import { Client } from "discord.js";
    import { join } from "path";

    class Bot extends Client {
        public handler: Handler;
        constructor(options) {
            super(options);

            this.handler = new Handler(this, {
                commandsDir: path.join(__dirname, "./commands") // The directory where the commands are located
                staffRoles: ["123456789012345678"] // The roles for the 'staffOnly' option on the commands
                developersIDs: ["123456789012345678"] // The IDs for the 'developerOnly' option on the commands
                errorMessageEph: false, // If the error messages should be ephemeral or not
                errorMessages: { // Here you customize the error messages
                    cooldown: `You should wait to use this command again!`,
                    guildOnly: `This command is only allowed inside guilds!`,
                    staffOnly: `This command is only for staff!`,
                    developerOnly: `This command is only for my developers!`,
                    wrongChannel: `You're on the wrong channel to use this command!`,
                }
            });

            this.on("interactionCreate", (i) => this.handler.interaction(i));
        }
    }

    const bot = new Bot();

    bot.on("ready", () => console.log("Ready!"));
    bot.login("TOKEN");

```