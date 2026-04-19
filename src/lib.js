require('corifeus-utils');

const process = require('process');
const fs = require('fs');
const path = require('path');

const binaryPath = process.argv[1] || process.argv[0] || process.cwd();
const dirname = path.dirname(binaryPath);
const basename = path.basename(binaryPath);

const getSettings = (cli = basename, settingsFile = 'settings.json') => {
    // 1) ENV override
    const envPath = process.env.P3X_SYSTEMD_SETTINGS || process.env.P3X_SETTINGS;

    // 2) CLI args
    const args = process.argv.slice(2);
    const argEq = args.find((a) => a.startsWith('--settings='));
    const argIdx = args.findIndex((a) => a === '--settings' || a === '-s');

    let providedPath;
    if (envPath) {
        providedPath = envPath;
    } else if (argEq) {
        providedPath = argEq.split('=')[1];
    } else if (argIdx !== -1 && args[argIdx + 1]) {
        providedPath = args[argIdx + 1];
    } else if (args[0] && !args[0].startsWith('-')) {
        // Backward compatibility: first non-flag argument is the path
        providedPath = args[0];
    }

    // 3) Default next to the executable
    const defaultFile = `${dirname}/${settingsFile}`;

    const isProvided = !!providedPath;
    let target = providedPath || (fs.existsSync(defaultFile) ? defaultFile : undefined);
    if (!target) {
        console.log(`
Please provide a settings file.
Examples:
  ${cli} ${settingsFile}
  ${cli} --settings ./settings.json
  P3X_SYSTEMD_SETTINGS=./settings.json ${cli}
`);
        return false;
    }

    try {
        // Support absolute or relative paths
        if (!path.isAbsolute(target)) {
            target = path.resolve(isProvided ? process.cwd() : dirname, target);
        }
        return require(target);
    } catch (e) {
        console.error(`Could not load settings from: ${target}`);
        console.error(e);
        return false;
    }
}

const simpleFilter = (list, result) => {
    if (typeof list === 'string') {
        list = [list];
    }
    let listRegexp = list.map((exclude) => {
        return new RegExp(exclude, 'i');
    })
    return (filter) => {
        if (listRegexp.length === 0) {
            return result;
        }
        for (let oneRegexp of listRegexp) {
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
    if (typeof types === 'string') {
        types = [types];
    }
    const isType = (unitId) => {
        if (types.length === 0) {
            return true;
        }
        for (let type of types) {
            if (unitId.endsWith(`.${type}`)) {
                return true;
            }
        }
        return false;
    }

    const isExcluded = simpleFilter(settings.filter.exclude || [], false);
    const isIncluded = simpleFilter(settings.filter.include || [], true);

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
