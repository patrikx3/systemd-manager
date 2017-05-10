const systemd = require('./../systemd');
const Interface = require('./../Interface');

const interfaceName = 'org.freedesktop.systemd1.Job';

module.exports = {
    factory: async (unit, settings, options = systemd.defaults.options) => {
        const manager = await systemd.getInterface(settings, unit, interfaceName);
        return new Interface(manager, settings, options);
    },
    interfaceName: interfaceName
}