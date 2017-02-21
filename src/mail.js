const nodemailer = require('nodemailer');
const os = require('os');

module.exports = (settings) => {
    const transporter = nodemailer
        .createTransport(settings.nodemailer.config);

    transporter.verify()
        .then((result) => {
            console.log('Mail is working.');
        })
        .catch((error) => {
            console.error('Mail is not working.', error);
        });

    const send = (from, to, subject, body) => {
        if (typeof body !== 'string') {
            body = JSON.stringify(body, null, 2);
        }
        const message = {
            from: from,
            to: to,
            subject: subject,
            text: body
        };
        console.log(message);
        transporter.sendMail(message)
            .then((info) => {
                console.log(info);

            })
            .catch((error) => {
                console.error(error);
            });
    }


    const system = {
        send: (subject, body) => {
            subject = `${os.hostname()} - ${subject}`;
            send(settings.email.from, settings.email.to, subject, body );
        }
    }

    return {
        send: send,
        system: system
    };
}
