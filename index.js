const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const express = require('express');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ]
});

// Register AOI Style Global Slash Commands
const commands = [
    new SlashCommandBuilder().setName('help').setDescription('View AOIX advanced features menu'),
    new SlashCommandBuilder().setName('meme').setDescription('Get a random trending image meme'),
    new SlashCommandBuilder().setName('play').setDescription('Get free stable high-quality music bot connections'),
    new SlashCommandBuilder().setName('ping').setDescription('Check bot network latency')
].map(cmd => cmd.toJSON());

client.once('ready', async () => {
    console.log(`${client.user.tag} System Engine Online.`);
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('AOIX Slash commands loaded globally.');
    } catch (e) { console.error(e); }
});

// Handle Interactions
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const { commandName } = interaction;

    // /help command
    if (commandName === 'help') {
        const embed = new EmbedBuilder()
            .setTitle('🔮 AOIX Super Bot Core Dashboard')
            .setColor('#5865F2')
            .setDescription('Welcome to your advanced multi-purpose bot ecosystem.')
            .addFields(
                { name: '🖼️ Media & Fun', value: '`/meme` - Fetches dynamic photo memes instantly' },
                { name: '🎵 Music Streaming', value: '`/play` - Deploy stable premium music server bots' },
                { name: '⚙️ Core Utility', value: '`/ping` - Check active server response time' }
            );
        return interaction.reply({ embeds: [embed] });
    }

    // /ping command
    if (commandName === 'ping') {
        return interaction.reply(`🏓 **Pong!** Latency is \`\${client.ws.ping}ms\`.`);
    }

    // /meme command (Photo sending module)
    if (commandName === 'meme') {
        await interaction.deferReply();
        try {
            const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
            const res = await fetch('https://meme-api.com');
            const data = await res.json();
            
            const embed = new EmbedBuilder()
                .setTitle(data.title)
                .setImage(data.url)
                .setColor('#FEE75C');
            return interaction.editReply({ embeds: [embed] });
        } catch { 
            return interaction.editReply('❌ Media API is busy, please try again!'); 
        }
    }

    // /play command (Stable cloud tracking link)
    if (commandName === 'play') {
        const embed = new EmbedBuilder()
            .setTitle('🎵 Premium 24/7 Lag-Free Music Deployment')
            .setColor('#ED4245')
            .setDescription('Due to YouTube restrictions on standalone custom codes in 2026, hosting direct audio streams on free plans causes immediate crashes. Click below to add verified high-quality public music nodes with loop features to your server with one-click!')
        
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setLabel('➕ Invite Verified Music Bot').setURL('https://top.gg').setStyle(ButtonStyle.Link)
        );
        return interaction.reply({ embeds: [embed], components: [row] });
    }
});

// Web Server Binds
const app = express();
app.get('/', (req, res) => res.send('AOIX Core Active'));
app.listen(process.env.PORT || 3000);

client.login(process.env.TOKEN);
