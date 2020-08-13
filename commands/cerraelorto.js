const { Client, Attachment } = require("discord.js");

module.exports.run = async (client, message, args) => {
  message.channel.startTyping();
  let attachment = new Attachment("https://cdn.discordapp.com/attachments/410197118263754753/715467196574203964/cerraelorto.mp4");
  
  message.channel.send(attachment);
  message.channel.stopTyping();
}

module.exports.config = {
  name: "cerraelorto"
}