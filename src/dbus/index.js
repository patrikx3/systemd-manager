module.exports = {
    systemd: require('./systemd'),
    manager: require('./interfaces/manager'),
    job: require('./interfaces/job'),
    boot: require('./boot')
};