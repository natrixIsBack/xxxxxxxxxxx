const fs = require('fs');
const path = require('path');
const { ActivityType } = require('discord.js');

module.exports = {
  name: 'clientReady',
  once: true,
  async execute(client) {
    console.log(`Connecté en tant que ${client.user.tag}`);
    try { client.user.setPresence({ activities: [{ name: 'LB Store • /help', type: ActivityType.Listening }], status: 'online' }); } catch(e){}

    // Déployer les commandes lors du démarrage
    try {
      const deploy = require('../deploy-commands');
      if (deploy && deploy.registerCommands) {
        await deploy.registerCommands();
        console.log('✅ Commandes déployées au démarrage.');
      }
    } catch (err) {
      console.error('Erreur lors du déploiement des commandes:', err);
    }

    // Créer et gérer le salon vocal avec compteur de membres
    try {
      const configPath = path.join(__dirname, '..', '..', 'data', 'voiceConfig.json');
      let voiceConfig = {};
      
      if (fs.existsSync(configPath)) {
        voiceConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      }

      // Parcourir tous les serveurs où le bot est
      for (const guild of client.guilds.cache.values()) {
        let voiceChannelId = voiceConfig[guild.id];

        // Vérifier si le salon vocal existe encore
        if (voiceChannelId) {
          const channel = await guild.channels.fetch(voiceChannelId).catch(() => null);
          if (!channel) {
            delete voiceConfig[guild.id];
            voiceChannelId = null;
          }
        }

        // Si le salon n'existe pas, le créer
        if (!voiceChannelId) {
          try {
            const newChannel = await guild.channels.create({
              name: `👥 ${guild.memberCount} members`,
              type: 2, // Type canal vocal
            });
            voiceConfig[guild.id] = newChannel.id;
            voiceChannelId = newChannel.id;
            console.log(`✅ Salon vocal créé pour ${guild.name}: ${newChannel.id}`);
          } catch (err) {
            console.error(`Erreur création salon vocal pour ${guild.name}:`, err.message);
          }
        } else {
          // Vérifier que le salon vocal existe toujours
          try {
            const channel = guild.channels.cache.get(voiceChannelId);
            if (channel && channel.type === 2) {
              console.log(`✅ Salon vocal existant trouvé: ${channel.name}`);
            }
          } catch (err) {
            console.error(`Erreur vérification salon:`, err.message);
          }
        }
      }

      // Sauvegarder la configuration
      fs.writeFileSync(configPath, JSON.stringify(voiceConfig, null, 2));
      
      // Function to update voice channel names with current member counts
      const updateVoiceCounts = async () => {
        try {
          if (!fs.existsSync(configPath)) return;
          const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8')) || {};
          for (const [gId, chId] of Object.entries(cfg)) {
            try {
              const g = await client.guilds.fetch(gId).catch(() => null);
              if (!g) continue;
              const ch = await g.channels.fetch(chId).catch(() => null);
              if (!ch) continue;
              const memberCount = g.memberCount;
              const newName = `👥 ${memberCount} members`;
              if (ch.name !== newName) await ch.setName(newName).catch(() => {});
            } catch (e) {
              // ignore per-channel errors
            }
          }
        } catch (e) {
          console.error('Error updating voice counts:', e);
        }
      };

      // Run immediately and then every hour
      updateVoiceCounts();
      setInterval(updateVoiceCounts, 1000 * 60 * 60);
      
      // Update bot activity with total member count
      const updateActivity = async () => {
        try {
          let total = 0;
          for (const g of client.guilds.cache.values()) {
            total += g.memberCount || 0;
          }
          await client.user.setPresence({ activities: [{ name: `${total} members • LB Store`, type: ActivityType.Watching }], status: 'online' });
        } catch (e) {
          console.error('Error updating activity:', e);
        }
      };

      updateActivity();
      setInterval(updateActivity, 1000 * 60 * 60);
    } catch (err) {
      console.error('Erreur gestion salon vocal:', err);
    }
  },
};