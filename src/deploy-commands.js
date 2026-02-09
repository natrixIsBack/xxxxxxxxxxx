const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function registerCommands() {
  const commands = [];
  const commandsPath = path.join(__dirname, 'commands');
  const gather = (dir) => {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
      if (file.isDirectory()) gather(path.join(dir, file.name));
      if (file.isFile() && file.name.endsWith('.js')) {
        const cmd = require(path.join(dir, file.name));
        if (cmd.data?.toJSON) commands.push(cmd.data.toJSON());
      }
    }
  };
  gather(commandsPath);

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  try {
    console.log(`Enregistrement de ${commands.length} commandes sur le serveur ${process.env.GUILD_ID}...`);
    await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands });
    console.log('✅ Commandes enregistrées.');
  } catch (error) {
    console.error('Erreur enregistrement commandes:', error);
    throw error;
  }
}

module.exports = { registerCommands };

// Permet d'exécuter le script directement : `node src/deploy-commands.js`
if (require.main === module) {
  registerCommands().catch(e => process.exit(1));
}