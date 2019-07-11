const exec = require('child_process').exec;
const ms = require('millisecond');
const Mail = require('./mail')
const moment = require('moment');
const lib = require('./lib');
const parseRow = /^([^\s]+)([\s]+)([^\s]+)([\s]+)([^\s]+)([\s]+)([^\s]+)([\s]+)(.+)$/;

module.exports = (settings) => {

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
            const [, unit, , load, , active, , sub, , description] = parseRow.exec(line);
            dbUpdate[unit] = {
                unit: unit,
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
    const update = async () => {
        return new Promise((resolve, reject) => {
            exec(command, {
                maxBuffer: 10 * 1024 * 1024
            }, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }
                if (stderr !== '') {
                    reject(new Error({
                        stderr: stderr,
                        stout: stdout,
                    }));
                    return;
                }
                resolve(parseStatus(stdout));
            });

        })
    }

    /**
     * The watch program.
     */
    const watch = async () => {

        try {
            const dbUpdate = await update();
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
                 mail.send(`NOT FOUND`, notFound);
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
                if (db[unit] === undefined && filter.isValid(unit)) {
                    watchUpdate.added[unit] = lib.clone(dbUpdate[unit]);
                } else if (JSON.stringify(db[unit]) !== JSON.stringify(dbUpdate[unit]) && filter.isValid(unit)) {
                    watchUpdate.changes[unit] = {
                        'old': lib.clone(db[unit]),
                        'new': lib.clone(dbUpdate[unit]),
                    };
                }
                delete db[unit];
            });
            watchUpdate.removed = {};
            Object.keys(db).forEach((unit) => {
                if (filter.isValid(unit)) {
                    watchUpdate.removed[unit] = lib.clone(db[unit]);
                }
            })
            db = dbUpdate;
            let sendChanges = false;
            Object.keys(watchUpdate).forEach((watchUpdateKey) => {
                if (Object.keys(watchUpdate[watchUpdateKey]).length > 0) {
                    sendChanges = true;
                }
            })
            if (sendChanges === true) {
                watchUpdate.moment = moment().format(settings.moment);
                mail.send(`CHANGED`, watchUpdate);
            }
        } catch (error) {
            mail.send(`ERROR`, error);
        }
        if (timeLastPing == undefined || Date.now() - timeLastPing > timePing) {
            console.log(`ping - ${Object.keys(db).length} items - every ${timePingString}`);
            //console.log(db);
            timeLastPing = Date.now();
        }
    }

    const mail = Mail(settings);

    const filter = lib.filter(settings);

//const command = 'sudo systemctl -all --full --plain --no-pager --no-legend ';
    let types = '';
    if (settings.filter.type.length > 0) {
        types = `--type=${settings.filter.type.join(',')}`;
    }
    const options = settings.options || '';
    const command = `${settings.sudo ? 'sudo ' : ''}systemctl --plain --no-pager --no-legend ${options} ${types}`;
// systemctl --state=not-found --all

    let db;
    let timeLastPing;

    let timePing = ms(settings.ping);
    let timePingString = settings.ping;
    let interval = ms(settings.interval)
    let intervalString = settings.interval;

    const showStatus = () => {
        if (settings.filter.type.length === 0) {
            console.log(`watchdog all`)
        } else {
            console.log(`watchdog type(s): ${settings.filter.type.join(',')}`)
        }
        console.log(`ping: ${timePingString}`);
        console.log(`interval: ${intervalString}`);
        console.log(`command: ${command}`);
    }

    console.log(`started`);
    if (settings.test) {
        interval = 3000;
        intervalString = interval + ' ms';
        timePing = 3000;
        timePingString = 3000 + ' ms';
        status(`TEST MODE`);
    }
    showStatus();


    return {
        run: () => {
            watch();
            setInterval(watch, interval);
        }
    }

}
