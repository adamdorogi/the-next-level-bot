# the-next-level-bot

Discord bot for The Next Level [discord.gg/the-next-level](https://discord.gg/the-next-level)

## Setup and Usage

1. Create a bot on Discord Developer Portal
   - Under "Bot", Enable server members intent and message intent
2. Get the code and install dependencies
   ```
   git clone https://github.com/adamdorogi/the-next-level-bot
   cd the-next-level-bot
   npm install
   ```
3. Create a `.env` file and configure the following properties:
   ```
   DISCORD_TOKEN=<Token from step 1.>
   GUILD_ID=0000000000000000000
   INVITE_CODE=the-next-level
   
   ADMIN_CHANNEL=0000000000000000000
   NEW_EVENT_CHANNEL=0000000000000000000
   MEMBER_INFO_CHANNEL=0000000000000000000
   
   NEW_EVENT_ROLE=0000000000000000000
   
   MONGODB_ENDPOINT=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
   DB=player-list
   ```
4. Configure the `src/roleConfig.ts` for auto-roles by creating the following mapping:
   ```json
   {
     "<channel ID>": {
         "<message ID>": {
             "<emoji or emoji ID>": "<role ID>",
             ...
         },
         ...
     },
     ...
   }
   ```
5. Add the bot to your server
   - Under "OAuth2" > "URL Generator", select:
     - Scopes: bot
     - Bot permissions: Manage Messages
     - Bot permissions: Manage Roles
     - Bot permissions: Mention Everyone
   - Go to the generated url, select your server when prompted, and continue the wizard to add the bot.
6. Configure bot permissions on server
   - Go to "Server Settings" > "Integrations", find your bot and click "Manage".
   - Configure the role and channel permissions for the bot and its commands.
7. Move the role of the bot above all of the roles specified in `src/roleConfig.ts`. This will rank the bot higher than those roles, allowing the bot to assign and unassign those roles.
8. Build and start the bot using pm2. In `the-next-level-bot` directory, run:
   ```
   npm install pm2@latest -g
   npm run build
   pm2 start dist/bot.js
   ```
