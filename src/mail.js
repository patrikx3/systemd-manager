const nodemailer = require('nodemailer');
const os = require('os');
const moment = require('moment');

let singletonInstance;
module.exports = (settings) => {

    if (settings.nodemailer.singleton && singletonInstance !== undefined) {
        return singletonInstance;
    }

    const transporter = nodemailer
        .createTransport(settings.nodemailer.config);

    let verified = false;
    transporter.verify()
        .then(() => {
            console.log('Mail is working.');
            verified = true;
        })
        .catch((error) => {
            console.log('Mail is not working.', error);
            verified = false;
        });

    const send = (from, to, subject, body) => {
        if (body === undefined) {
            body = subject;
            subject = '';
        }
        const momentify = (js) => {
            return Object.assign({
                timestamp: moment().format(settings.moment)
            }, js)
        }
        if (body instanceof Error) {
            body = JSON.parse(JSON.stringify(body, ["message", "arguments", "type", "name", 'stack']));
            console.error(body);
        }

        if (typeof body !== 'string') {
            body = momentify(body);
            body = JSON.stringify(body, null, 2);
        } else {
            body = `
${moment().format(settings.moment)}

${body}
`;
        }

        const message = {
            from: from,
            to: to,
            subject: subject,
            text: body
        };
        console.log(`send new mail subject: ${subject}`);
        transporter.sendMail(message)
            .then((info) => {
                console.log(info.response);
            })
            .catch((error) => {
                console.log(`send error email`);
                console.error(error);
            });
    }

    const factory = {
        send: (subject, body) => {
            if (body === undefined) {
                body = subject;
                if (body instanceof Error) {
                    subject = 'error'
                } else {
                    subject = 'trigger'
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
}
