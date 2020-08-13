const { Discord, Client, RichEmbed } = require("discord.js");

module.exports.run = async (client, message, args) => {
  let embed = new RichEmbed()
    .setTitle(`📶 ${client.user.username} - Ping:`)
    .setDescription(`**Discord API:** \`${Date.now() - message.createdTimestamp} ms\`.\n**Bot Ping:** \`${Math.round(client.ping)} ms\`.`)
    .setColor("RANDOM")
    .setTimestamp()
    .setFooter("rel. ver. 0.0.1", client.user.avatarURL)
  message.channel.send(embed)
}

module.exports.config = {
    name: "ping"
};
