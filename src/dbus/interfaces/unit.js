const systemd = require('./../systemd');
const Interface = require('./../Interface');

class Unit extends Interface {

    constructor(node, manager, options = systemd.defaults.options) {
        super(manager, options);

        this.node = node;

        this.summaryProps = {
            Id: 'Id',
            Description: 'Description',
            LoadState: 'LoadState',
            ActiveState: 'ActiveState',
            SubState: 'SubState',
            OnFailure: 'OnFailure',
        };
    }


    get notFound() {
        return this.prop(this.summaryProp.LoadState)
            .then((value) => {
                return value === 'not-found'
            })
    }

    get failed() {
        return this.prop(this.summaryProp.ActiveState)
            .then((value) => {
                return value === 'failed'
            })
    }
}

const interfaceName = 'org.freedesktop.systemd1.Unit';

module.exports = {
    factory: async (node, settings, options = systemd.defaults.options) => {
        const manager = await systemd.getInterface(settings, node, interfaceName);
        return new Unit(node, manager, settings, options);
    },
    interfaceName: interfaceName
}