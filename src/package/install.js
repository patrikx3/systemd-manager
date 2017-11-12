const utils = require('corifeus-utils');

const os = require('os');

const pkg = require('../../package.json');

const install = async() => {

    const arch = os.arch();
    const platform = os.platform()

    let platformSearch;
    let archSearch;
    if (platform === 'linux') {
        platformSearch = 'linux';
        if (arch === 'x64') {
            archSearch = 'amd64';
        }
    }

    if (platformSearch === undefined || archSearch === undefined) {
        console.log(`This platform for ${pkg.name} is not implemented: ${platform}/${arch}`);
        console.log(`The ${pkg.name} will not work, but will work silently`);
        return
    }

    console.warn(`You probably might need a c++11 if it is old,`)
    await utils.childProcess.exec(`sudo apt-get install libdbus-1-dev libglib2.0-dev`, true)

    console.log(`Found platform: ${platformSearch} and architecture ${archSearch}`);

    console.log(`Install done`);
}
install();