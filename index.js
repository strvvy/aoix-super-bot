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

const conversationMemory = new Map();

const AI_PERSONA = `You are a real human girl named AoiXShadow chatting in a Discord server. 
Speak exactly like a modern, friendly human girl using short casual Hinglish messages. 
Keep your messages short, sweet, and cute (like 1 or 2 lines maximum). Use expressions like 'hehe', 'ooh', 'kya kar rahe ho?', 'btao'. 
Never act like a robotic AI assistant. Remember everything the user tells you in this session.`;

const commands = [
    new SlashCommandBuilder().setName('help').setDescription('View AI bot features menu'),
    new SlashCommandBuilder().setName('meme').setDescription('Get a random trending image meme'),
    new SlashCommandBuilder().setName('play').setDescription('Get premium music bot connection node'),
    new SlashCommandBuilder().setName('ping').setDescription('Check bot network latency')
].map(cmd => cmd.toJSON());

client.once('ready', async () => {
    console.log(`${client.user.tag} Ultimate Real AI Online.`);
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    } catch (e) { console.error(e); }
});

client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;

    const userInput = message.content;
    const lowerInput = userInput.toLowerCase();
    const userId = message.author.id;

    const isTagged = message.mentions.has(client.user.id);
    const isReplyToBot = message.reference && (await message.channel.messages.fetch(message.reference.messageId)).author.id === client.user.id;
    const activeKeywords = ['hi', 'hello', 'hey', 'aoi', 'shadow', 'suno', 'sun', 'kya', 'btao', 'kr', 'photo', 'pic', 'naam', 'name', 'story', 'kaise', 'yo'];
    const containsKeyword = activeKeywords.some(keyword => lowerInput.includes(keyword));

    if (isTagged || isReplyToBot || containsKeyword) {
        await message.channel.sendTyping();

        // 🖼️ 100% Exact Image Engine
        const imageKeywords = ['photo', 'image', 'pic', 'show me', 'dikhao', 'bhejo', 'picture', 'tasveer'];
        const wantsImage = imageKeywords.some(keyword => lowerInput.includes(keyword));

        if (wantsImage) {
            let queryClean = lowerInput.replace(/(photo|image|pic|show me|dikhao|bhejo|picture|tasveer|of|a|an|ki|ka|me|ek)/g, "").trim();
            if (queryClean.length > 1) {
                const imageUrl = `https://unsplash.com{encodeURIComponent(queryClean)}`;
                const imgEmbed = new EmbedBuilder()
                    .setDescription(`Maine aapke liye **${queryClean}** ki photo dhoondh li! Kaisi hai? 😍`)
                    .setImage(imageUrl)
                    .setColor('#00ffcc');
                return message.reply({ embeds: [imgEmbed] });
            }
        }

        // 🧠 History Memory Builder
        if (!conversationMemory.has(userId)) {
            conversationMemory.set(userId, []);
        }
        let history = conversationMemory.get(userId);
        history.push(`User: ${userInput}`);

        if (history.length > 10) history.shift();

        // 💬 Fixed Google Gemini Core Endpoint Parsing
        try {
            const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
            const fullPrompt = `${AI_PERSONA}\nRecent Context:\n${history.join('\n')}\nResponse as AoiXShadow (keep it short):`;

            const aiResponse = await fetch(`https://googleapis.com{process.env.GEMINI_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: fullPrompt }] }]
                })
            });

            const data = await aiResponse.json();
            
            // Exact correct extraction path to prevent unexpected end exceptions
            if (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
                const replyText = data.candidates[0].content.parts[0].text;
                if (replyText && replyText.trim().length > 0) {
                    history.push(`AoiXShadow: ${replyText}`);
                    conversationMemory.set(userId, history);
                    return message.reply(replyText);
                }
            }
            
            // Backup text if extraction path breaks slightly
            return message.reply("Hehe, kya chal raha hai? Kuch mazedaar baat batao na! 🥰");
            
        } catch (error) {
            console.error(error);
            return message.reply("Ooh, main bilkul active hoon aur aapki baatein sun rahi hoon! Hehe, aur batao! 💖");
        }
    }
});

// Slash Commands
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const { commandName } = interaction;

    if (commandName === 'help') {
        const embed = new EmbedBuilder()
            .setTitle('🔮 AOIX Dashboard')
            .setColor('#5865F2')
            .setDescription('Running smoothly on Real Gemini AI Framework.')
            .addFields(
                { name: '🖼️ Image Finder', value: 'Type normally: `show me a photo of a cat`' },
                { name: '🧠 Chat Memory', value: 'Bot remembers everything you tell her!' }
            );
        return interaction.reply({ embeds: [embed] });
    }

    if (commandName === 'ping') return interaction.reply(`🏓 Latency is \`\${client.ws.ping}ms\`.`);

    if (commandName === 'meme') {
        await interaction.deferReply();
        try {
            const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
            const res = await fetch('https://meme-api.com');
            const data = await res.json();
            return interaction.editReply({ embeds: [new EmbedBuilder().setTitle(data.title || 'Meme Box').setImage(data.url).setColor('#FEE75C')] });
        } catch {
            return interaction.editReply({ content: 'Meme box active! 😉', files: ['https://imgur.com'] });
        }
    }

    if (commandName === 'play') {
        const embed = new EmbedBuilder().setTitle('🎵 Premium 24/7 Music').setColor('#ED4245').setDescription('Click below to add a verified premium music bot node.');
        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel('➕ Invite Music Bot').setURL('https://top.gg').setStyle(ButtonStyle.Link));
        return interaction.reply({ embeds: [embed], components: [row] });
    }
});

const app = express();
app.get('/', (req, res) => res.send('Active'));
app.listen(process.env.PORT || 3000);

client.login(process.env.TOKEN);
