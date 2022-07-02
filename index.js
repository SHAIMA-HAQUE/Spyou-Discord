const toxicity = require('@tensorflow-models/toxicity');

const fs = require('node:fs');
// Require the necessary discord.js classes
const { Client, Collection, Intents,MessageEmbed } = require('discord.js');
const { token } = require('./config.json'); //comment out for deployment

// Create a new client instance
const client = new Client({ 
	intents: [Intents.FLAGS.GUILDS,
			Intents.FLAGS.GUILD_MESSAGES,
] });

// The minimum prediction confidence.
const threshold = 0.9;
let model;

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


client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

// When the client is ready, run this code (only once)
client.once('ready', async() => {
	model = await toxicity.load(threshold);
	console.log('Ready!');
});


client.on("messageCreate", async msg => {
	let pred = [];
	if (msg.author.bot) { 
		return; 
	}else{
		text = msg.content;
		let predictions = await model.classify(text);
		predictions.forEach(prediction => {
			if(prediction.results[0].match){
				pred.push(prediction.label);
			}
		});
		let text_display = "";
        if(pred.length != 1 && pred.length >0){
			for(let i=0; i<pred.length-1;i++){
					text_display += pred[i].charAt(0).toUpperCase() + pred[i].slice(1) + " and ";
			}
			text_display += pred[pred.length-1].charAt(0).toUpperCase() + pred[pred.length-1].slice(1);
		}else if(pred.length == 1){
			text_display = pred[0].charAt(0).toUpperCase() + pred[0].slice(1);
		}
		if (pred.length !=0){
			msg.channel.send(`Deleted message from <@${msg.author.id}> as ${text_display} was detected in the message! Please adhere to community guidelines`);
			msg.delete()
			.then(msg => console.log(`Deleted message from ${msg.author.username}`))
			.catch(console.error);
		}
	   }// with mention
});
   
	
// Login to Discord with your client's token
client.login(token);
//process.env.DISCORD_TOKEN -> for heroku