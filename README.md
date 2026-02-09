# Discord Bot — LB Store

Bot Discord complet en JavaScript (discord.js v14) configuré pour le serveur `1083746112386641942`.

Fonctionnalités principales :
- Accueil configurable des nouveaux membres (embed violet)
- Commandes de modération : /kick /ban /mute /unmute /purge /warn
- Système de giveaways : /giveaway start /giveaway end /giveaway reroll
- Commandes utilitaires : /ping /help /invite /setup-welcome

Installation rapide :
1. Copier `.env.example` → `.env` et remplir `TOKEN` et `CLIENT_ID`.
2. npm install
3. npm run deploy (en local pour enregistrer les commandes slash dans le serveur)
4. npm start

Notes :
- Le bot utilise des fichiers JSON simples dans `data/` pour stocker la configuration.
- Les couleurs d'embeds sont violettes par défaut. Modifie `src/utils/embed.js` si besoin.
