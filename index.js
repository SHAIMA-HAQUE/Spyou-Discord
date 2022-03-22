//require('@tensorflow/tfjs');
const toxicity = require('@tensorflow-models/toxicity');

const fs = require('node:fs');
const { Client, Collection, Intents,MessageEmbed } = require('discord.js');
const { token } = require('./config.json');

const client = new Client({ 
	intents: [Intents.FLAGS.GUILDS,
			Intents.FLAGS.GUILD_MESSAGES,
] });

// The minimum prediction confidence.
const threshold = 0.9;
let model;
// Load the model. Users optionally pass in a threshold and an array of
// labels to include.

  //const sentences = ['you suck'];

//   model.classify(sentences).then(predictions => {
//     // `predictions` is an array of objects, one for each prediction head,
//     // that contains the raw probabilities for each input along with the
//     // final prediction in `match` (either `true` or `false`).
//     // If neither prediction exceeds the threshold, `match` is `null`.

//     console.log(predictions);
//     /*
//     prints:
//     {
//       "label": "identity_attack",
//       "results": [{
//         "probabilities": [0.9659664034843445, 0.03403361141681671],
//         "match": false
//       }]
//     },
//     {
//       "label": "insult",
//       "results": [{
//         "probabilities": [0.08124706149101257, 0.9187529683113098],
//         "match": true
//       }]
//     },
//     ...
//      */
//   });
// });

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

client.once('ready', async() => {
	model = await toxicity.load(threshold);
	console.log('Ready!');
});


client.on("messageCreate", async msg => {
	if (msg.author.bot) { return; }
	else{
		let predictions = await model.classify(msg.content);
		predictions.forEach(prediction => {
			if(prediction.results[0].match){
				var pred = prediction.label
				msg.reply("Warning!" + pred + " detected!");
				//console.log(prediction.label)
			}
		}); 
	   }// with mention
});
    // var message = new MessageEmbed()
    //   .setDescription("Pong") // sets the body of it
    //   .setColor("#00ff00") // sets the color of the embed
    //   .setThumbnail("https://www.google.com/imgres?imgurl=https%3A%2F%2Fcdn.pixabay.com%2Fphoto%2F2015%2F04%2F23%2F22%2F00%2Ftree-736885__480.jpg&imgrefurl=https%3A%2F%2Fpixabay.com%2Fimages%2Fsearch%2Fnature%2F&tbnid=DH7p1w2o_fIU8M&vet=12ahUKEwjIkLHuhdL2AhVmyXMBHQ1cBdIQMygBegUIARDWAQ..i&docid=Ba_eiczVaD9-zM&w=771&h=480&q=images&ved=2ahUKEwjIkLHuhdL2AhVmyXMBHQ1cBdIQMygBegUIARDWAQ") // sets the thumbnail of the embed
    //   .setTitle("This is an embed")
    // //msg.channel.send("Ping!") // without mention
	

client.login(token);