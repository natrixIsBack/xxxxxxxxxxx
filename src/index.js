const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildVoiceStates], partials: [Partials.Channel] });client.commands = new Collection();

// Chargement des commandes
const loadCommands = (dir) => {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    if (file.isDirectory()) loadCommands(path.join(dir, file.name));
    if (file.isFile() && file.name.endsWith('.js')) {
      const command = require(path.join(dir, file.name));
      if (command?.data?.name) client.commands.set(command.data.name, command);
    }
  }
};
loadCommands(path.join(__dirname, 'commands'));

// Chargement des événements
const eventFiles = fs.readdirSync(path.join(__dirname, 'events')).filter(f => f.endsWith('.js'));
for (const file of eventFiles) {
  const event = require(path.join(__dirname, 'events', file));
  if (event.once) client.once(event.name, (...args) => event.execute(...args, client));
  else client.on(event.name, (...args) => event.execute(...args, client));
}

// Simple giveaways manager (checks every 10s for finished giveaways)
const GIVEAWAYS_FILE = path.join(__dirname, '..', 'data', 'giveaways.json');
setInterval(() => {
  try {
    if (!fs.existsSync(GIVEAWAYS_FILE)) return;
    const data = JSON.parse(fs.readFileSync(GIVEAWAYS_FILE, 'utf8')) || [];
    const now = Date.now();
    let changed = false;
    data.forEach(async g => {
      if (!g.ended && g.endsAt <= now) {
        g.ended = true;
        changed = true;
        try {
          const guild = await client.guilds.fetch(g.guildId);
          const channel = await guild.channels.fetch(g.channelId);
          let message = await channel.messages.fetch(g.messageId);
          message = await message.fetch().catch(() => message);

          const reaction = message.reactions.cache.get('🎉');
          if (!reaction) {
            console.log(`Giveaway ${g.messageId} — no 🎉 reaction`);
            channel.send({ content: `Giveaway ended: **${g.prize}** — No participants.` });
            return;
          }
          const usersCol = await reaction.users.fetch();
          const users = usersCol.filter(u => !u.bot).map(u => u.id) || [];
          if (users.length === 0) {
            channel.send({ content: `Giveaway ended: **${g.prize}** — No participants.` });
            return;
          }
          const winners = [];
          for (let i=0;i<Math.min(g.winners, users.length); i++) {
            const chosen = users.splice(Math.floor(Math.random()*users.length),1)[0];
            winners.push(`<@${chosen}>`);
          }
          channel.send({ content: `🎉 **Giveaway ended** — **${g.prize}**\nWinners: ${winners.join(', ')}` });
        } catch (err) {
          console.error('Error finishing giveaway:', err);
        }
      }
    });
    if (changed) fs.writeFileSync(GIVEAWAYS_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error checking giveaways:', err);
  }
}, 10000);

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

client.login(process.env.TOKEN).catch(err => {
  if (err?.message?.includes('Used disallowed intents') || err?.message?.includes('disallowed intents')) {
    console.error('ERREUR: Le bot utilise des intents privilégiés (ex: GuildMembers). Active "Server Members Intent" dans le Discord Developer Portal: https://discord.com/developers/applications -> Ton application -> Bot -> Privileged Gateway Intents.');
  }
  console.error(err);
  process.exit(1);
});
