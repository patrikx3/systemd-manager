[//]: #@corifeus-header


[![Build Status](https://travis-ci.org/patrikx3/systemd-watchdog-notify.svg?branch=master)](https://travis-ci.org/patrikx3/systemd-watchdog-notify)
[![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/patrikx3/systemd-watchdog-notify/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/patrikx3/systemd-watchdog-notify/?branch=master)
[![Code Coverage](https://scrutinizer-ci.com/g/patrikx3/systemd-watchdog-notify/badges/coverage.png?b=master)](https://scrutinizer-ci.com/g/patrikx3/systemd-watchdog-notify/?branch=master)  [![Trello](https://img.shields.io/badge/Trello-p3x-026aa7.svg)](https://trello.com/b/gqKHzZGy/p3x)


[//]: #corifeus-header:end

# SystemD Watchdog Notify 
This notifies changes in the SystemD via e-mail.
Right now it polls, so that it gets all changes. It task about 30-50 milliseconds per run on my 3.3 GHz Pentium 2 cores, it is nothing instead tons of functions. All automatic, requires email and a few tweaks as you want.

## Using terminal
```bash
git clone https://github.com/patrikx3/systemd-watchdog-notify.git
cd systemd-watchdog-notify
./watchdog ./dev.json
```

## Settings 
```json
{
  // you can ommit
  "test": true,
  "service": "p3x-watchdog",
  "interval": "1 minute",
  "ping": "2 hours",
  // you can have empty Array
  "types": [
    "service"
  ],
  "mail": {
    "prefix": "P3X-WATCHDOG"
  },
  "email": {
    "to": "try@me.tk",
    "from": "me@with.you"
  },
  // this is basically nodemailer settings, whateve you want
  "nodemailer": {
    "config": {
      "host": "mail.server.org",
      "port": 465,
      "secure": true,
      "auth": {
        "user": "username",
        "pass": "password"
      }
    }
  }
}
```

## Using from code
```javascript
const Watchdog = require('systemd-watchdog-notify');
const settings = require('watchdog.json');
const watchdog = Watchdog(settings);
watchdog.run();
```

[//]: #@corifeus-footer

[by Patrik Laszlo](http://patrikx3.tk)

[//]: #@corifeus-footer:end