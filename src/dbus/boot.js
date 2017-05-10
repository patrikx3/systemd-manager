const boot = async (settings) => {

    if (settings.boot !== undefined && settings.boot.enabled !== true) {
        console.log('Boot is disabled');
        return;
    }

    const Mail = require('../mail')
    const lib = require('../lib');
    const dbus = require('./index');
    const filter = lib.filter(settings);
    const manager = await dbus.manager.factory(settings);
    const mail = Mail(settings);

    /*
     const eventHelper = (item) => {
     console.log(`Subscribe Event: ${item}`);
     manager.on(item, function() {
     console.log(item);
     console.log(arguments);
     })
     }
     Object.keys(manager.event).forEach((ev) => eventHelper(ev))
     */

    try {
        console.log(await manager.summary);
        const units = await manager.listUnits;

        /*
         manager.on(manager.event.JobNew, async function(pid, jobNode, unitId) {
         console.log(arguments);
         try {
         const job = await dbus.job(jobNode);
         console.log(await job.props);
         } catch (e) {
         mail.send(e);
         }
         })
         */

        console.log('Boot is enabled');
        const unitIds = Object.keys(units);
        const boot = {};
        for(let unitId of unitIds) {
            if (filter.isValid(unitId)) {
                const unit = await manager.getUnit(unitId);
                const props = await unit.props;
                for(let unitProp of Object.keys(settings.boot.trigger)) {
                    if (settings.boot.trigger[unitProp].includes(props[unitProp])) {
                        boot[unitProp] = boot[unitProp] || {};
                        boot[unitProp][props[unitProp]] = boot[unitProp][props[unitProp]] || [];
                        boot[unitProp][props[unitProp]].push(unitId);
                    }
                }
            }
        }

        if (Object.keys(boot).length > 0) {
            mail.send('boot', boot);
            console.log(boot);
        }

    } catch(e) {
        mail.send(e);
    }

}


module.exports = boot