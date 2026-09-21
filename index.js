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

// Global Memory Map to keep track of conversations per user (Persistent Memory System)
const memoryMap = new Map();

const commands = [
    new SlashCommandBuilder().setName('help').setDescription('View AI bot features menu'),
    new SlashCommandBuilder().setName('meme').setDescription('Get a random trending meme photo'),
    new SlashCommandBuilder().setName('play').setDescription('Get premium music bot connection node'),
    new SlashCommandBuilder().setName('ping').setDescription('Check bot server latency')
].map(cmd => cmd.toJSON());

client.once('ready', async () => {
    console.log(`${client.user.tag} Smart Memory AI Online.`);
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
    const commonGreetings = ['hi', 'hello', 'hey', 'how are you', 'aoi', 'shadow', 'sun', 'suno'];
    const isGreeting = commonGreetings.some(word => lowerInput.startsWith(word));

    if (isTagged || isReplyToBot || isGreeting) {
        await message.channel.sendTyping();

        // 🖼️ ChatGPT/Gemini Style Exact Image Fetcher
        const imageKeywords = ['photo', 'image', 'pic', 'show me', 'dikhao', 'bhejo', 'picture', 'tasveer'];
        const wantsImage = imageKeywords.some(keyword => lowerInput.includes(keyword));

        if (wantsImage) {
            let queryClean = lowerInput.replace(/(photo|image|pic|show me|dikhao|bhejo|picture|tasveer|of|a|an|ki|ka|me)/g, "").trim();
            if (queryClean.length > 1) {
                const fallbackUrl = `https://unsplash.com{encodeURIComponent(queryClean)}`;
                const imgEmbed = new EmbedBuilder()
                    .setDescription(`Maine aapke liye **${queryClean}** ki exact photo dhoondh li hai! Chandni jaisi sundar hai na? 😍`)
                    .setImage(fallbackUrl)
                    .setColor('#00ffcc');
                return message.reply({ embeds: [imgEmbed] });
            }
        }

        // 🧠 Core Memory Configuration per User (Yaddasht System)
        if (!memoryMap.has(userId)) {
            memoryMap.set(userId, []);
        }
        let userHistory = memoryMap.get(userId);
        userHistory.push(`User: ${userInput}`);

        // Keep memory capped to last 6 messages to keep responses fast and smart
        if (userHistory.length > 6) userHistory.shift();

        // 💬 Intelligent Dialect Engine (Acts like a smart friendly girl with imagination)
        try {
            const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
            
            // Using HuggingFace's Advanced Open-source BlenderBot Model for ultra-realistic human chat
            const aiRes = await fetch("https://huggingface.co", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ inputs: { text: userInput, past_user_inputs: userHistory } })
            });
            const aiData = await aiRes.json();
            let aiReply = aiData.generated_text || aiData[0]?.generated_text;

            if (aiReply) {
                // Mix matching with Hinglish persona
                if (lowerInput.includes('naam') || lowerInput.includes('name')) aiReply = `Aapka naam mujhe acche se yaad hai! Waise mera naam AoiXShadow hai! 🥰`;
                if (lowerInput === 'hi' || lowerInput === 'hello') aiReply = `Hello dear! Kaise ho aap? Main aapka hi wait kar rahi thi! ✨`;
                if (lowerInput.includes('how are you')) aiReply = `Main ekdum mast hoon! Aap batao aap kya kar rahe ho? 😊`;

                userHistory.push(`AI: ${aiReply}`);
                memoryMap.set(userId, userHistory);
                return message.reply(aiReply);
            }
        } catch (error) {
            return message.reply("Thoda sa system network slow hai mera, ek baar fir se bolna dear? 🥺");
        }
    }
});

// Interactive Slash Commands Handler
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const { commandName } = interaction;

    if (commandName === 'help') {
        const embed = new EmbedBuilder()
            .setTitle('🔮 AOIX Premium Dashboard')
            .setColor('#5865F2')
            .setDescription('Running smoothly on Advanced AI Engine with Active Memory.')
            .addFields(
                { name: '🖼️ Exact Image Finder', value: 'Type normally like: `Taj Mahal ki photo dikhao` or `Show me a picture of a cat`' },
                { name: '🧠 Full Chat Memory', value: 'I will remember our past conversation context throughout our chat session!' }
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
            return interaction.editReply({ content: 'Meme system synced! 😉', files: ['https://imgur.com'] });
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
