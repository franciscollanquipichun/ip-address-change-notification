import * as fs from 'fs';

/**
 * Get current public IP from checkip.amazonaws.com
 * ref: https://codingactions.com/how-to-get-my-public-ip-address-using-node-js/
 * @returns string
 */
function getPublicIp() {
    const { execSync } = require("child_process");
    const cmd = `curl -s https://checkip.amazonaws.com || printf "0.0.0.0"`;
    return execSync(cmd).toString().trim();
}

/**
 * Get IP stored
 */
function getStoredIps(database) {
    try {
        if (!fs.existsSync(database)) fs.appendFileSync(database, '[]', { encoding: "utf8" });
        const data = fs.readFileSync(database, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        throw e;
    }
}

function storeIp(database, ipsData, ip) {
    ipsData.push({
        ipv4: ip,
        updated_at: new Date().toString()
    });
    fs.writeFileSync(database, JSON.stringify(ipsData));
}

async function sendEmail(to, ip) {
    if (!process.env.SMTP_HOST) throw new Error('SMTP config not found');

    const nodemailer = require('nodemailer');
    const message = {
        from: "sender@server.com",
        to,
        subject: "Public IP address has been updated !",
        text: `Current public IP: ${ip}`,
        html: `<p>Current public IP</p><p>${ip}</p>`
    }
    var transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: true, // use SSL
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
    await transporter.sendMail(message);
}

export async function onChangeIpAddressSendNotification(argsOpt) {
    const options = {
        ...argsOpt,
        database: './database.json',
    };
    const publicIp = getPublicIp();
    console.log('Current public ip:', publicIp);
    if (publicIp === '0.0.0.0') throw new Error('public IP not found');

    // Compara y registra IPs en base de datos 
    const ipsData = getStoredIps(options.database);
    if (ipsData[ipsData.length - 1] && ipsData[ipsData.length - 1].ipv4 === publicIp) {
        console.log('public ip address unchanged');
    } else {
        storeIp(options.database, ipsData, publicIp);
        sendEmail(options.notificationEmail, publicIp);
    }
}