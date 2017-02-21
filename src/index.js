module.exports = (settings) => {

    const exec = require('child_process').exec;
    const ms = require('millisecond');

    const Mail = require('./mail')
    const mail = Mail(settings);

    const parseRow = /^([^\s]+)([\s]+)([^\s]+)([\s]+)([^\s]+)([\s]+)([^\s]+)([\s]+)(.+)$/;
//const command = 'systemctl -all --full --plain --no-pager --no-legend ';
    let types = '';
    if (settings.types.length > 0) {
        types = `--type=${settings.types.join(',')}`;
    }
    const options = settings.options || '';
    const command = `systemctl --plain --no-pager --no-legend ${options} ${types}`;
// systemctl --state=not-found --all

    let db;
    let timeLastPing;

    let timePing = ms(settings.ping);
    let interval = ms(settings.interval)


    const showStatus = () => {
        if (settings.types.length === 0 ) {
            status(`watchdog all`)
        } else {
            status(`watchdog type(s): ${settings.types.join(',')}`)
        }
        status(`ping: ${timePing} ms - ${settings.ping}`);
        status(`interval: ${interval} ms - ${settings.interval}`);
        status(`command: ${command}`);
    }

    const status = (message) => {
        console.log(`${settings.mail.prefix}: ${message}`);
    };

    status(`started`);
    showStatus();
    if (settings.test) {
        interval = 3000;
        timePing = 3000;
        status(`TEST MODE`);
        showStatus();
    }


    /**
     * Parses systemctl services
     * @param input
     * @returns {{}}
     */
    const parseStatus = (input) => {
        const lines = input.split("\n");
        lines.pop();

        const dbUpdate = {};
        lines.forEach((line) => {
            const [, unit, , load, , active , , sub, , description ]= parseRow.exec(line);
            dbUpdate[unit] = {
                load: load,
                active: active,
                sub: sub,
                description: new String(description).trim()
            };
        })
        return dbUpdate;
    }

    /**
     * Runs an update of getting current services and parses and returns at once.
     * @returns {Promise}
     */
    const update = () => {
        return new Promise((resolve, reject) => {
            exec(command, {
                maxBuffer: 10 * 1024 * 1024
            },  (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }
                if (stderr !== '') {
                    reject({
                        stderr: stderr,
                        stout: stdout,
                    });
                    return;
                }
                resolve(parseStatus(stdout));
            });

        })
    }

    /**
     * Simple clone program
     * @param obj
     */
    const clone = (obj) => {
        return JSON.parse(JSON.stringify(obj));
    }

    /**
     * The watch program.
     */
    const watch = () => {

        update()
            .then((dbUpdate) => {
                if (db === undefined) {
                    db = dbUpdate;
                    /*
                     const notFound = [];
                     Object.keys(db).forEach((key) => {
                     if (db[key].load == 'not-found') {
                     notFound.push(db[key]);
                     }
                     })
                     if (notFound.length > 0) {
                     mail.system.send(`${settings.mail.prefix}: NOT FOUND`, notFound);
                     }
                     */
                    return;
                }

                const watchUpdate = {
                    changes: {},
                    added: {},
                    removed: {}
                }
                Object.keys(dbUpdate).forEach((unit) => {
                    if (db[unit] === undefined) {
                        watchUpdate.added[unit] = clone(dbUpdate[unit]);
                    } else if(JSON.stringify(db[unit]) !== JSON.stringify(dbUpdate[unit])) {
                        watchUpdate.changes[unit] = {
                            'old': clone(db[unit]),
                            'new': clone(dbUpdate[unit]),
                        };
                    }
                    delete db[unit];
                });
                watchUpdate.removed = clone(db);
                db = dbUpdate;
                let sendChanges = false;
                Object.keys(watchUpdate).forEach((watchUpdateKey) => {
                    if (Object.keys(watchUpdate[watchUpdateKey]).length > 0) {
                        sendChanges = true;
                    }
                })
                if (sendChanges === true) {
                    mail.system.send(`${settings.mail.prefix}: CHANGED`, watchUpdate );
                }
            })
            .catch((error) => {
                console.error(error);
                mail.system.send(`${settings.mail.prefix}: ERROR`, error );
            })
            .then(() => {
                if (timeLastPing == undefined || Date.now() - timeLastPing > timePing ) {
                    status(`ping - ${Object.keys(db).length} items - every ${settings.ping}`);
                    //console.log(db);
                    timeLastPing = Date.now();
                }
            })
    }

    return {
        run: () => {
            watch();
            setInterval(watch, interval);
        }
    }

}
