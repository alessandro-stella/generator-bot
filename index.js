const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.once("ready", () => {
    console.log(`Bot loggato come ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
    if (message.author.bot || message.content !== "!generate") return;

    let flag = false;
    let tries = 0;

    do {
        tries++;
        console.log(`Current try: ${tries}`);

        const code = generateRandomCode(16);
        const isValidCode = await checkCode(code);
        flag = isValidCode;

        /* await message.reply({
                embeds: [
                    {
                        title: isValidCode
                            ? "Codice trovato!"
                            : "Codice non funzionante",
                        description: code,
                        color: isValidCode ? 5763719 : 15548997,
                    },
                ],
            }); */

        if (isValidCode)
            await message.reply(`
                <@786974456165302312> - <@449913245562568704>\n\nhttps://discord.com/gifts/${code}`);
    } while (!flag);

    console.log("Code ended!");
});

client.login(process.env.DISCORD_TOKEN);

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateRandomCode(charNumber) {
    const chars =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    let code = "";

    for (let i = 0; i < charNumber; i++) {
        code += chars.at([Math.floor(Math.random() * chars.length)]);
    }

    return code;
}

async function checkCode(code) {
    const url = `https://discord.com/api/v9/entitlements/gift-codes/${code}?country_code=IT&payment_source_id=1255250543983726793&with_application=true&with_subscription_plan=true`;

    const response = await fetch(url).then((res) => res.json());

    if (response.retry_after !== null) {
        await delay(response.retry_after * 1000);
    }

    return (
        response.message !== "The resource is being rate limited." &&
        response.message !== "Unknown Gift Code"
    );
}
