# dsc.cmds
A slash command and context menu commands handler for Discord.js bots

`npm i dsc.cmds`

> **DISCLAIMER** *This will only work with discord.js version 13.1 or later*

#### [Support](https://discord.gg/GtaxXxNYaD)

### Examples
Here's an example of how you can use the command handler.

#### Javascript
```js
    const { Commands } = require("dsc.cmds");
    const { Client } = require("discord.js");

    const bot = new Client();
    const cmds = new Commands({
        bot: bot,
        dir: './commands',
    });

    bot.on("ready", () => console.log("Ready!"));

    bot.login("TOKEN");

```
