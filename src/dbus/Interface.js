const systemd = require('./systemd');

class Interface {

    constructor(manager, settings, options = systemd.defaults.options) {
        this.settings = settings;
        this.options = options;
        this.manager = manager;
        this.summaryProps = {};
    }


    on(event, cb) {
        this.manager.on(event, cb);
    }

    get props() {
        return new Promise((resolve, reject) => {
            this.manager.getProperties((err, values) => {
                if (err) {
                    reject(err)
                }
                resolve(values);
            });
        })
    }

    prop(prop) {
        return new Promise((resolve, reject) => {
            this.manager.getProperty(prop, (err, value) => {
                if (err) {
                    reject(err)
                }
                resolve(value);
            });
        })
    }


    get summary() {
        return this.props.then((values) => {
            const summary = {};
            Object.keys(this.summaryProps).forEach((key) => {
                summary[key] = values[key];
            })
            return summary;
        })
    }

}

module.exports = Interface;