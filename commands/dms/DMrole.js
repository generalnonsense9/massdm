/*jshint esversion: 6 */

const commando = require('discord.js-commando');
const config = require('../../config.json');
const Discord = require('discord.js');
const Promise = require('bluebird');
const { Permissions } = require('discord.js');

class DMroleCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: `dmrole`,
            group: 'dms',
            memberName: 'dmrole',
            description: 'Sends message provided to all members of the specified role.',
            examples: [`${config.prefix}dmall @Administrators Hey fellas! This might reach more people than a mass ping...`]
        });
    }

    async run(message, args) {
        let role = message.mentions.roles.first();
        let msg = message.content;
        const adminPermissions = new Permissions('ADMINISTRATOR');

        if (message.guild) {
            let botusr = message.guild.members.find(o => o.id == this.client.user.id)
            if (!botusr.hasPermission(adminPermissions)) {
                console.log(`WARNING: Bot is not properly configured with administrative permissions.`);
            }

            if (!role) {
                message.author.send("No valid role mentioned!");
                return;
            }

            try {
                msg = msg.substring(msg.indexOf(">") + 1);
            } catch (error) {
                console.log(error);
                return;
            }

            if (!msg || msg.length <= 1) {
                const embed = new Discord.RichEmbed()
                    .addField(":x: Failed to send", "Message not specified")
                    .addField(":eyes: Listen up!", "Every character past the role mention will be sent,\nand apparently there was nothing to send.");
                message.channel.send({ embed: embed });
                return;
            }

            let memberarray = role.members.array();
            let membercount = memberarray.length;
            let botcount = 0;
            let successcount = 0;
            console.log(`Responding to ${message.author.username} :  Sending message to all ${membercount} members of role ${role.name}.`)

            await Promise.map(memberarray, async (member) => {
                if (!member.user.bot) {
                    const timeout = Math.floor((Math.random() * (config.wait - 0.01)) * 1000) + 10;
                    await this.sendMessage(msg, member, timeout);

                    successcount++;
                    await Promise.delay(timeout);
                } else {
                    console.log(`Skipping bot with name ${member.user.username}`)
                    botcount++;
                }
                return Promise.resolve();
            }, { concurrency: config.concurrency || 3 });

            console.log(`Sent ${successcount} ${(successcount != 1 ? `messages` : `message`)} successfully, ` +
                `${botcount} ${(botcount != 1 ? `bots were` : `bot was`)} skipped.`);
        }
        message.reply('Guild not available');
    }

    async sendMessage(msg, member, timeout) {
        console.log(`Waited ${timeout}ms.\t\\/\tDMing ${member.user.username}`);
        try {
            member.send(`${msg} \n #${timeout}`);
        } catch (error) {
            console.log(`--Failed to send DM! ` + error)
        }
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = DMroleCommand;