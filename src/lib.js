require('corifeus-utils');

const process = require('process');
const fs = require('fs');
const path = require('path');

const dirname = path.dirname(process.argv[1]);
const basename = path.basename(process.argv[1]);

const getSettings = (cli = basename, settingsFile = 'settings.json') => {
    let settings;

    const defaultFile = `${dirname}/${settingsFile}`;
    if (fs.existsSync(defaultFile)) {
        settings = require(defaultFile);
    } else if (process.argv.length < 3) {
        console.log(`
Please use an argument for the settings.
For example:
${cli} ${settingsFile}
`);
        return false;
    } else {
        settings = require(`${dirname}/{process.argv[2]}`);
    }
    return settings;
}

const simpleFilter = (list, result) => {
    if (typeof list === 'string') {
        list = [list];
    }
    let listRegexp = list.map((exclude) => {
        return new RegExp(exclude, 'i');
    })
    return isList = (filter) => {
        if (listRegexp.length === 0) {
            return result;
        }
        for(let oneRegexp of listRegexp) {
            if (oneRegexp.test(filter)) {
                return !result;
            }
        }
        return result;
    }
}

const filter = (settings) => {
    if (settings.filter === undefined) {
        settings.filter = {
            type: [],
            exclude: [],
            include: []
        }
    }
    let types = settings.filter.type || [];
    if ( typeof types === 'string') {
        types = [types];
    }
    const isType = (unitId) => {
        if (types.length === 0) {
            return true;
        }
        for(let type of types) {
            if (unitId.endsWith(`.${type}`)) {
                return true;
            }
        }
        return false;
    }

    const isExcluded = simpleFilter(settings.filter.exclude || [], false);
    const isIncluded = simpleFilter(settings.filter.included || [], true);

    return {
        isType: isType,
        isExcluded: isExcluded,
        isIncluded: isIncluded,
        isValid: (unitId) => {
            return isType(unitId) && isIncluded(unitId) && !isExcluded(unitId);
        }
    }
}

/**
 * Simple clone program
 * @param obj
 */
const clone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
}

module.exports.clone = clone;
module.exports.filter = filter;
module.exports.getSettings = getSettings;