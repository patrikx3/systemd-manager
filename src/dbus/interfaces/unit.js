const systemd = require('./../systemd');
const Interface = require('./../Interface');

class Unit extends Interface {

    constructor(node, manager, settings, options = systemd.defaults.options) {
        super(manager, settings, options);

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
        return this.prop(this.summaryProps.LoadState)
            .then((value) => {
                return value === 'not-found'
            })
    }

    get failed() {
        return this.prop(this.summaryProps.ActiveState)
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
