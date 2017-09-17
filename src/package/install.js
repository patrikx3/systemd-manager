const utils = require('corifeus-utils');
const os = require('os');

const install = async() => {

    const arch = os.arch();
    const platform = os.platform()

    console.log(`Found platform: ${platform} and architecture ${arch}`);

    console.log(`
    

*************************************************************
*************************************************************
*************************************************************
    
Please execute on Debian based or equivalent for your system: 
sudo apt-get install libdbus-1-dev libglib2.0-dev

*************************************************************
*************************************************************
*************************************************************

`)

    console.log(`Install done`);
}
install();