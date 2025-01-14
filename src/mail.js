const nodemailer = require('nodemailer');
const os = require('os');
const moment = require('moment');

let singletonInstance;

module.exports = (settings) => {

    if (!settings.hasOwnProperty('ignoreErrors')) {
        settings.ignoreErrors = [];
    }

    if (settings.nodemailer.singleton && singletonInstance !== undefined) {
        return singletonInstance;
    }

    const send = async (from, to, subject, body) => {
        if (body === undefined) {
            body = subject;
            subject = '';
        }
        const momentify = (js) => {
            return Object.assign({
                timestamp: moment().format(settings.moment)
            }, js);
        };
        console.log('settings.ignoreErrors', settings.ignoreErrors);
        if (body instanceof Error) {
            console.error(body);
            if (settings.ignoreErrors.includes(body.message)) {
                console.warn('Ignoring known message:', body.message);
                console.info('Not sending e-mail');
                return;
            }
            body = JSON.parse(JSON.stringify(body, ["message", "arguments", "type", "name", "stack"]));
        }

        if (typeof body !== 'string') {
            body = momentify(body);
            body = JSON.stringify(body, null, 4);
        } else {
            body = `
${moment().format(settings.moment)}

${body}
`;
        }

        const htmlBody = `<pre>${body}</pre>`; // Wrapping content in <pre> tags for HTML

        // Message object with only HTML content
        const message = {
            from: from,
            to: to,
            subject: subject,
            html: htmlBody // HTML content only
        };
        console.log(`Sending new mail. Subject: ${subject}`);
        console.log('Message:', message);
        try {
            let transporter = nodemailer.createTransport(settings.nodemailer.config);
            const info = await transporter.sendMail(message);
            console.log(info.response);
            transporter.close();
        } catch (e) {
            console.log(`Error while sending email`, message);
            console.error(e, message);
        }
    };

    const factory = {
        send: (subject, body) => {
            if (body === undefined) {
                body = subject;
                if (body instanceof Error) {
                    subject = 'Error';
                } else {
                    subject = 'Trigger';
                }
            }
            subject = `${settings.prefix}: ${os.hostname()} - ${subject}`;
            send(settings.email.from, settings.email.to, subject, body);
        }
    };

    if (settings.nodemailer.singleton) {
        singletonInstance = factory;
    }

    return factory;
};
