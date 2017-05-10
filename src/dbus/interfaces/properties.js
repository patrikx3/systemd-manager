const systemd = require('./../systemd');
const Interface = require('./../Interface');

class Properties extends Interface {
    constructor(node, manager, options = systemd.defaults.options) {
        super(manager, options);
        this.node = node;
    }
}

const interfaceName = 'org.freedesktop.DBus.Properties';

module.exports = {
    factory: async (node, settings, options = systemd.defaults.options) => {
        const manager = await systemd.getInterface(settings, node, interfaceName);
        return new Properties(node, manager, settings, options);
    },
    interfaceName: interfaceName
}