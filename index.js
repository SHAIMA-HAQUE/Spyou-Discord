

const fs = require('node:fs');
const { Client, Collection, Intents,MessageEmbed } = require('discord.js');
const { token } = require('./config.json');

const client = new Client({ 
	intents: [Intents.FLAGS.GUILDS,
			Intents.FLAGS.GUILD_MESSAGES,
] });

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

client.once('ready', () => {
	console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});


client.on("message", msg => {
    // var message = new MessageEmbed()
    //   .setDescription("Pong") // sets the body of it
    //   .setColor("#00ff00") // sets the color of the embed
    //   .setThumbnail("https://www.google.com/imgres?imgurl=https%3A%2F%2Fcdn.pixabay.com%2Fphoto%2F2015%2F04%2F23%2F22%2F00%2Ftree-736885__480.jpg&imgrefurl=https%3A%2F%2Fpixabay.com%2Fimages%2Fsearch%2Fnature%2F&tbnid=DH7p1w2o_fIU8M&vet=12ahUKEwjIkLHuhdL2AhVmyXMBHQ1cBdIQMygBegUIARDWAQ..i&docid=Ba_eiczVaD9-zM&w=771&h=480&q=images&ved=2ahUKEwjIkLHuhdL2AhVmyXMBHQ1cBdIQMygBegUIARDWAQ") // sets the thumbnail of the embed
    //   .setTitle("This is an embed")
    // //msg.channel.send("Ping!") // without mention
    msg.reply("Ping!") // with mention
})

client.login(token);