const systemd = require('./../systemd');
const Interface = require('./../Interface');
const unit = require('./unit');

class Manager extends Interface {

    constructor(manager, settings, options = systemd.defaults.options) {
        super(manager, settings, options);

        this.summaryProps = {
            NNames: 'NNames',
            NInstalledJobs: 'NInstalledJobs',
            NFailedJobs: 'NFailedJobs',
            Progress: 'Progress',
            ShowStatus: 'ShowStatus'
        };
    }

    get listUnits() {
        return new Promise((resolve, reject) => {
            this.manager.ListUnits(this.options, (error, result) => {
                if (error) {
                    return reject(error);
                }
                const units = result[0];
                resolve(units, this.settings, this.options);
            });
        })
    }

    async getUnit(unitName, options = this.options) {
        return new Promise((resolve, reject) => {
            this.manager.GetUnit(unitName, options, (error, unitNode) => {
                if (error) {
                    return reject(error);
                }
                resolve(unit.factory(unitNode));
            });
        })
    }


    get event() {
        return {
            UnitNew: 'UnitNew',
            UnitRemoved: 'UnitRemoved',
            JobNew: 'JobNew',
            JobRemoved: 'JobRemoved',
            StartupFinished: 'StartupFinished',
            UnitFilesChanged: 'UnitFilesChanged',
            Reloading: 'Reloading'
        }
    }


}

module.exports = {
    factory: async (settings, options = systemd.defaults.options) => {
        const manager = await systemd.getInterface(settings);
        return new Manager(manager, settings, options);
    },
    interfaceName: systemd.defaults._interface._interface
}