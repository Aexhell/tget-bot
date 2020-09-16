require('dotenv').config();
const express = require("express");
const app = express();
const { Discord, Collection, RichEmbed, Client, MessageCollector, Attachment } = require("discord.js");
const keepalive = require('express-glitch-keepalive');
const fs = require("fs");
const db = require("quick.db");
const dateTime = require('date-time');
const text2png = require('text2png');
 
app.use(express.static("public"));
app.get("/", (request, response) => {
  response.json("I live!");
});
app.get("/", (req, res) => {
  response.sendStatus(200);
});
app.listen(process.env.PORT || 5000)

const client = new Client({ partials: ['MESSAGE', 'REACTION']});
client.commands = new Collection();
client.code = new Map();
client.stars = new Map();
client.login(process.env.TOKEN);

fs.readdir(__dirname + "/commands", (err, files) => {
    if (err) console.error(err);
    let jsfiles = files.filter(f => f.split(".").pop() === "js");
    if (jsfiles.length <= 0) { 
        console.log("No hay ningún archivo para cargar.");
        return;
    }

    console.log(`¡Cargando ${jsfiles.length} commandos!`);

    jsfiles.forEach((f, i) => {
        let props = require(`./commands/${f}`);
        console.log(`¡${f} cargado!`);
        client.commands.set(props.config.name, props);
    });
});

let statuses = [`rel. ver. 0.0.3`, `TGet!`];
let status = statuses[Math.floor(Math.random() * statuses.length)];

function starboarding(message, user, channel) {
  var image = message.attachments.first().url;
  if (image) image = embed.setImage(image);
  else image = null;
  let embed = new RichEmbed()
    .setAuthor(message.author.tag, message.author.displayAvatarURL)
    .setDescription(message.content)
    .setColor("RANDOM")
    .addField("Source:", `[Jump!](${message.link})`)
  return channel.send(embed);
}

client.on("ready", () => {
  console.log(`¡${client.user.tag} está listo!`);
  setInterval(function() {
    client.user.setPresence({
      status: 'online',
      game: { 
        name: status,
        type: 'WATCHING'
      }});   
  }, 100000)
});

function makecode(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

client.on("guildMemberAdd", async (member, guild) => {
  let channel = client.channels.get("715699593270001755");
  let role = member.guild.roles.get("555126986025205761");
  let logs = client.channels.get("715363138308014141");
  var amount = `${makecode(4)}-${makecode(4)}-${makecode(4)}`;
  let code = db.set(`${member.user.id}_code`, amount);
  var image = text2png(code, {
    font: '80px Lato',
    localFontPath: 'fonts/lato.ttf',
    localFontName: 'Lato',
    color: 'white',
    backgroundColor: 'black',
    lineSpacing: 10,
    padding: 20
  });
  var trying = 0;
  
  const attachment = new Attachment(image);
  
  member.addRole(role, "TheTGetVerification v3.0. El usuario necesita verificarse manualmente.");
  channel.send(`¡Bienvenido al servidor de **TGet**, ${member}!\nEsta medida de seguridad funciona como un método de precaución en contra de los raids y los intentos de molestar a los usuarios.\n\nPara poder acceder al servidor, debes introducir este código en los próximos 15 minutos, o este expirará. Recuerda que este código SOLO puede ser utilizado por ti:`, attachment)
  
  const filter = m => m.content;
  const collector = channel.createMessageCollector(filter);
  
  let timeout = setTimeout(function() {
    if (!code) return;
    if (collector.done === true) {
      channel.fetchMessages({ limit: 100 }).then(messages => channel.bulkDelete(messages.size));
      return clearTimeout(timeout);
    };
    db.delete(`${member.user.id}_code`);
    logs.send(`[VERIFY] El usuario **${member.user.tag}** ha fallado en su verificación.\nRazón: Inactividad. Enviado al canal de <#700846129448878130>.`);
    member.setRoles(["700458683414347866"], "El usuario ha tardado en verificarse. Enviado al canal de #ataúd.");
    channel.fetchMessages({ limit: 50 }).then(messages => channel.bulkDelete(messages.size));
    return;
  }, 900000);
  
  collector.on('collect', m => {
    if (m.author.bot) return;
    if (m.author.id !== member.id) return;
    var d = new Date();
    if (trying === 4) {
      member.setRoles(["700458683414347866"], "El usuario ha agotado sus intentos. Enviado al canal de #ataúd.");
      collector.done = true;
      return;
    }
    if (m.content !== code) {
        if (trying === 4) return;
        trying += 1;
        channel.send(`:x: | \`Has ingresado el código mal! Te quedan ${5-trying} intentos. Aquí tienes el código por si se borró:\``, attachment);
        return;
    }
    m.delete();
    member.setRoles([]);
    console.log(`[VERIFY] El usuario ${member.user.tag} ha completado su verificación.`);
    db.delete(`${member.user.id}_code`);
    collector.done = true;
    logs.send(`[VERIFY] (${member})\n\`\`\`asciidoc\n= Usuario =\n[${member.user.id}]\n= Momento =\n[${dateTime()}]\n= Resultado =\n[Verificación completada.]\`\`\``);
  });
  
   let embed = new RichEmbed()
     .setAuthor(member.user.tag, member.user.displayAvatarURL)
     .setTitle(`¡Bienvenido a ${member.guild.name}!`)
     .setDescription("¡Recuerda leer el apartado de <#535971661984432128> y los <#591464305392615474>!")
     .setThumbnail(member.avatarURL)
     .setFooter(member.guild.name, member.guild.iconURL)
     .setColor("RANDOM")
     .setTimestamp()
  client.channels.get("496044498401361920").send(embed)
});

client.on("guildMemberRemove", (member, guild, message) => {
  const channel = client.channels.get("496044498401361920");
  db.delete(`${member.user.id}_code`);
  let embed = new RichEmbed()
    .setAuthor(member.user.tag, member.user.displayAvatarURL)
    .setTitle(`Adios, vuelve después...`)
    .setDescription(`${member} se ha ido del servidor`)
    .setThumbnail(member.avatarURL)
    .setTimestamp()
    .setFooter(member.guild.name, member.guild.iconURL)
    .setColor("RANDOM")
  channel.send(embed)
});

function checkURL(url) {
    return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
}

client.on('messageReactionAdd', async (reaction, user) => {
    const handleStarboard = async () => {
        const starboard = client.channels.find(channel => channel.name.toLowerCase() === 'starboard');
        const msgs = await starboard.fetchMessages({ limit: 100 });
        const existingMsg = msgs.find(msg => 
            msg.embeds.length === 1 ?
            (msg.embeds[0].footer.text.startsWith(reaction.message.id) ? true : false) : false);
        if(existingMsg) existingMsg.edit(`⭐ **${reaction.count}** ${reaction.message.channel.toString()}`);
        else {
          const embed = new RichEmbed()
                .setAuthor(reaction.message.author.tag, reaction.message.author.displayAvatarURL)
                .addField('Source:', `[Jump!](${reaction.message.url})`)
                .setTimestamp(reaction.message.createdTimestamp)
                .setColor("RANDOM")
                .setFooter(reaction.message.id);
          if (reaction.message.content !== null) embed.setDescription(reaction.message.content)
          if (reaction.message.attachments.size !== 0 && checkURL(reaction.message.attachments.first().url)) embed.setImage(reaction.message.attachments.first().url);
            if(starboard)
                reaction.message.react("🌟");
                starboard.send(`⭐ **${reaction.count}** ${reaction.message.channel.toString()}`, embed);
        }
    }
    if(reaction.emoji.name === '⭐' && reaction.count === 3) {
        if(reaction.message.channel.id === '724642490602487829') return;
        if(reaction.message.partial) {
            await reaction.fetch();
            await reaction.message.fetch();
            handleStarboard();
        }
        else
            handleStarboard();
    }
});

client.on('messageReactionRemove', async (reaction, user) => {
    const handleStarboard = async () => {
        const starboard = client.channels.find(channel => channel.name.toLowerCase() === 'starboard');
        const msgs = await starboard.fetchMessages({ limit: 100 });
        const existingMsg = msgs.find(msg => 
            msg.embeds.length === 1 ? 
            (msg.embeds[0].footer.text.startsWith(reaction.message.id) ? true : false) : false);
        if(existingMsg) {
            if(reaction.count === 0)
                existingMsg.delete({ timeout: 2500 });
            else
                existingMsg.edit(`⭐ **${reaction.count}** ${reaction.message.channel.toString()}`)
        };
    }
    if(reaction.emoji.name === '⭐') {
        if(reaction.message.channel.id === '724642490602487829') return;
        if(reaction.message.partial) {
            await reaction.fetch();
            await reaction.message.fetch();
            handleStarboard();
        }
        else
            handleStarboard();
    }
});

client.on("message", (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(process.env.PREFIX)) return;
  if (message.channel.type === "dm") return;
  
  let messageArray = message.content.split(" ");
  let cmd = messageArray[1].toLowerCase();
  let args = messageArray.slice(2);
  
  let command = messageArray[1];
  let log = command;
  console.log(`${message.author.tag} ha ejecutado el comando "${log}"`);
  
  let commandfile = client.commands.get(cmd);
  if (commandfile) commandfile.run(client, message, args);
})
