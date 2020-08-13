const { Discord, Client, RichEmbed } = require("discord.js");

module.exports.run = async (client, message, args) => {
  let user = message.mentions.members.first() || message.guild.members.get(args[0]) || message.member || message.guild.members.get(args[0]).id;
  
  let embed = new RichEmbed()
    .setAuthor(`• Avatar de ${user.user.tag}:`, user.user.displayAvatarURL)
    .setDescription(`[Link del Avatar](${user.user.displayAvatarURL}).`)
    .setImage(user.user.avatarURL)
    .setColor("RANDOM")
    .setTimestamp()
    .setFooter("rel. ver. 0.0.1", client.user.avatarURL)
  message.channel.send(embed)
}

module.exports.config = {
    name: "avatar"
};
