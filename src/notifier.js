const Mail = require('./mail')
const dbus = require('./dbus');
const interfaces = require('./dbus/interfaces');

const lib = require('./lib');

module.exports = async (settings) => {

    process.on("unhandledRejection", (err, promise) => {
        if (!settings.hasOwnProperty('ignoreErrors')) {
            settings.ignoreErrors = []
        }
        if (settings.ignoreErrors.includes(err.message)) {
            console.warn('ignoring known messsage', err)
            console.info('no crash')
            return
        }

        console.error(new Date().toLocaleString(), 'unhandledRejection', err, promise);
        process.exit(1);
    });


    const filter = lib.filter(settings);
    const mail = Mail(settings);
    let managerInterface = await dbus.manager.factory(settings);

    const debug = () => {
        const eventHelper = (item) => {
            console.log(`Subscribe Event: ${item}`);
            managerInterface.on(item, function () {
                console.log(item);
                console.log(arguments);
            })
        }
        Object.keys(managerInterface.event).forEach((ev) => eventHelper(ev))
    }

    const connect = async () => {

        const propertyInterfaces = [];
        let unitDictionary = await managerInterface.listUnits;

        Object.keys(unitDictionary).forEach(async (unitId) => {
            if (filter.isValid(unitId)) {
                const unit = await managerInterface.getUnit(unitId);
                const properties = await unit.props;
                const propertyInterface = await interfaces.properties.factory(unit.node, settings);

                /*
                let lastSubStates = {};
                Object.keys(settings.filter.status).forEach((state) => {
                    lastSubStates[state] = properties[state];
                });
                */
                propertyInterfaces.push(propertyInterface);

                propertyInterface.on('PropertiesChanged', async function (changedInterface, props, names) {
                    if (changedInterface === interfaces.unit.interfaceName) {
                        let trigger = false;
                        Object.keys(settings.filter.trigger).forEach((state) => {
                            if (settings.filter.trigger[state].includes(props[state])) {
                                trigger = true;
                            }
                            /*
                            if (props[state] !== lastSubStates[state]) {
                            }
                            */
                        })
                        if (!trigger) {
                            return;
                        }
                        /*
                        Object.keys(settings.filter.trigger).forEach((state) => {
                            lastSubStates[state] = props[state];
                        })
                        */

                        mail.send(unitId, {
                            summary: await unit.summary,
                            detailed: await unit.props
                        });

                    }
                })
            }
            ;
        })
        return () => {
            propertyInterfaces.forEach((propertyInterface) => {
                propertyInterface.manager.removeAllListeners('PropertiesChanged');
            });
        }
    }


    if (settings.debug !== undefined && settings.debug === true) {
        debug();
    }

    let kill;
    let reloadDebounce;
    const reload = async function (reloading) {
        //console.log(`Reloading: ${reloading}`);
        if (reloading) {
            return;
        }
        console.log('Debounced Reloading services');
        clearTimeout(reloadDebounce);
        reloadDebounce = setTimeout(async () => {
            try {
                console.log('Reloading services completed');
                (await kill)();
                kill = await connect();
            } catch (e) {
                mail.send('reload error', e);
            }
        }, 5000)
    }

    managerInterface.on(managerInterface.event.UnitFilesChanged, reload);
    managerInterface.on(managerInterface.event.Reloading, reload);

    kill = connect();

    /*
    manager.on(manager.event.JobRemoved, async function(id, job, unitId, result) {
        try {
            if (filter.isValid(unitId)) {
                const unit = await manager.getUnit(unitId);
                mail.send(unitId, {
                    summary: await unit.summary,
                    detailed: await unit.props
                });
            }

        } catch(e) {
            mail.send('error - job removed', e);
        }
    })
    */

}
