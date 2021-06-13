const process = require('process');
const DBus = require('dbus');

//gdbus introspect --system --dest org.freedesktop.systemd1 --object-path /org/freedesktop/systemd1
//https://www.freedesktop.org/wiki/Software/systemd/dbus/
//https://github.com/Shouqun/node-dbus
const defaults = {
    _interface: {
        system: 'org.freedesktop.systemd1',
        node: '/org/freedesktop/systemd1',
        _interface: 'org.freedesktop.systemd1.Manager'
    },
    options: {
        timeout: 1000
    }
}

const getInterface = async (
    settings = {
        'dbus': {
            'address': 'unix:path=/run/dbus/system_bus_socket',
            'display': ':0'
        }
    },
    node = defaults._interface.node,
    _interface = defaults._interface._interface,
    system = defaults._interface.system) => {

    process.env.DISPLAY = settings.dbus.display;
//    if (process.env.DBUS_SESSION_BUS_ADDRESS === undefined) {
        process.env.DBUS_SESSION_BUS_ADDRESS = settings.dbus.address;
//    }

    if (global.p3xBus === undefined) {
        global.p3xBus = DBus.getBus('system')
    }

    return new Promise((resolve, reject) => {
        global.p3xBus.getInterface(system, node, _interface, (error, manager) => {
            if (error) {
                return reject(error);
            }
            resolve(manager);
        });
    })
}

module.exports = {
    defaults: defaults,
    getInterface: getInterface,
}
