const { Client, Attachment } = require("discord.js");

module.exports.run = async (client, message, args) => {
  let attachment = new Attachment("https://media.discordapp.net/attachments/500383808705789952/724898441054126130/images.png");
  
  message.channel.send(attachment);
}

module.exports.config = {
  name: "mesi"
}