const { Client, Attachment } = require("discord.js");

module.exports.run = async (client, message, args) => {
  let attachment = new Attachment("https://cdn.discordapp.com/attachments/667356986769408000/724652738884927508/unknown.png");
  
  message.channel.send(attachment);
}

module.exports.config = {
  name: "papulince"
}