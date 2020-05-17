[//]: #@corifeus-header

[![NPM](https://nodei.co/npm/p3x-systemd-manager.png?downloads=true&downloadRank=true)](https://www.npmjs.com/package/p3x-systemd-manager/)

  

[![Donate for Corifeus / P3X](https://img.shields.io/badge/Donate-Corifeus-003087.svg)](https://paypal.me/patrikx3) [![Contact Corifeus / P3X](https://img.shields.io/badge/Contact-P3X-ff9900.svg)](https://www.patrikx3.com/en/front/contact) [![Corifeus @ Facebook](https://img.shields.io/badge/Facebook-Corifeus-3b5998.svg)](https://www.facebook.com/corifeus.software)  [![Build Status](https://api.travis-ci.com/patrikx3/systemd-manager.svg?branch=master)](https://travis-ci.com/patrikx3/systemd-manager)
[![Uptime Robot ratio (30 days)](https://img.shields.io/uptimerobot/ratio/m780749701-41bcade28c1ea8154eda7cca.svg)](https://uptimerobot.patrikx3.com/)





# ⌚ SystemD Manager, watchdog, notifier and service v2020.4.160



**Bugs are evident™ - MATRIX️**
    

### NodeJs LTS Version Requirement
```txt
>=12.13.0
```

### Built on NodeJs
```txt
v12.16.3
```

The ```async``` and ```await``` keywords are required. Only the latest LTS variant is supported.

Install NodeJs:
https://nodejs.org/en/download/package-manager/



# Description

                        
[//]: #@corifeus-header:end



## Use case
Get a notification via e-mail when a SystemD service becomes failed.
If you enable boot, every times to startup the notifier, it sends failed and not-found (trigger) services so you can remove them from SystemD and get cleaned.

Also it is easy to configure additional triggers like running, stopped or all the whole SystemD changes via LoadState / other properties and trigger a result / status and notify or add in different notifier like Twitter / Facebook etc. 

### Evolve
It is easy to evolve the functions. I just created for my server to get failed services via notify e-mail, but if you need additional functions, please fork and pull. It is easy to add in anything or change services etc... All DBus based and async/await wrappers.

## Detailed

It is a Linux/Unix/BSD (tested only in Debian/Testing repo) based SystemD manager. Notifies via e-mail with NodeMailer, it polls via an interval as a watchdog. It also has a wrapper for DBus to manage services and via events as well if you do not like polling. I guess watchdog will be replaced 100%.

## SystemD DBus Manager
References:
[DBus](https://www.freedesktop.org/wiki/Software/systemd/dbus/), 
[Node Dbus](https://github.com/Shouqun/node-dbus)

### Prerequisites

When you install, it will ask for ```sudo root```, because the dependencies are installed with ```apt```.

By now the install is automatic (not needed anymore, but these are the libs that the program uses):
```bash
#you probably might need a c++11 if it is old, 
#for additional requirements check out .travis.yml
sudo apt-get install libdbus-1-dev libglib2.0-dev
```

### Using from code

Please do not use ```yarn```, because it asks for ```sudo``` and prompt (unless you are ```root```).

```bash
npm install p3x-systemd-manager --save
```

#### SystemD DBus Notifier

```js
#!/usr/bin/env node
const systemd = require('p3x-systemd-manager');
const settings = systemd.lib.getSettings();
if (settings === false) {t
    return;
}
systemd.boot(settings);
systemd.notifier(settings);
```

#### SystemD Watchdog Notify 
This notifies changes in the SystemD via e-mail.
Right now it polls, so that it gets all changes. It task about 30-50 milliseconds per run on my 3.3 GHz Pentium 2 cores, not too much. All automatic, requires email and a few tweaks as you want.

```js
const Watchdog = require('p3x-systemd-manager').watchdog;
const settings = require('./settings.json');
const watchdog = Watchdog(settings);
watchdog.run();
```

##### Looks like this
```text
Feb 22 11:41:31 server systemd[1]: Started p3x-watchdog.
Feb 22 11:41:32 server watchdog[2196]: started
Feb 22 11:41:32 server watchdog[2196]: watchdog type(s): service
Feb 22 11:41:32 server watchdog[2196]: ping: 2 hours
Feb 22 11:41:32 server watchdog[2196]: interval: 10 seconds
Feb 22 11:41:32 server watchdog[2196]: command: systemctl --plain --no-pager --no-legend  --type=service
Feb 22 11:41:32 server watchdog[2196]: ping - 51 items - every 2 hours
Feb 22 11:41:32 server watchdog[2196]: Mail is working.
```

### Using terminal
```bash
git clone https://github.com/patrikx3/systemd-manager.git
cd systemd-manager
sudo apt-get install libdbus-1-dev libglib2.0-dev
npm install
./notifier settings.json
#it is used to be a watchdog, polling
./watchdog settings.json
```

### Settings
Checkout [```artifacts/setttings.json```](artifacts/settings.json)

```filter.type```: Array, can be empty, actual ```man systemctl``` type. Service is the safest. Not always working when you fine tune, some are weird.  

```nodemailer.config```: Exact nodemailer config, any of that.

```interval, ping```: Uses npm ```milliseconds``` framework for turn into actual milliseconds from a string. This is for ```Watchdog```, not needed anymore.

```sudo```: for the watchdog either you need to use root, or via sudo (```true|false```). For SystemD needs root, but you can use another user, and it will use sudo then when polling. 

For SystemD DBus notifier you need to use root anyway. I think it cannot do anything else so it's safe to take over the system, also it's internal, no web interface for now.

```json
{
  "debug": false,
  "filter": {
    "type": ["service"],
    "exclude": [],
    "include": [],
    "trigger": {
      "SubState": ["failed"]
    }
  },
  "boot": {
    "enabled": true,
    "trigger": {
      "SubState": ["failed"]
    }
  },
  "moment": "LLL",
  "prefix": "P3X-SYSTEMD-NOTIFIER",

  "dbus": {
    "address": "unix:path=/run/dbus/system_bus_socket",
    "display": ":0"
  },

  "interval": "watchdog only",
  "interval": "10 seconds",

  "ping": "watchdog only",
  "ping": "2 hours",

  "sudo": "watchdog only",
  "sudo": false,

  "email": {
    "to": "system@localhost",
    "from": "system@localhost"
  },
  "nodemailer": {
    "singleton": true,
    "config": {
      "host": "mail.localhost",
      "port": 465,
      "secure": true,
      "auth": {
        "user": "system@localhost",
        "pass": "unknown"
      }
    }
  }
}
```




[//]: #@corifeus-footer

---

🙏 This is an open-source project. Star this repository, if you like it, or even donate to maintain the servers and the development. Thank you so much!

Possible, this server, rarely, is down, please, hang on for 15-30 minutes and the server will be back up.

All my domains ([patrikx3.com](https://patrikx3.com) and [corifeus.com](https://corifeus.com)) could have minor errors, since I am developing in my free time. However, it is usually stable.

**Note about versioning:** Versions are cut in Major.Minor.Patch schema. Major is always the current year. Minor is either 4 (January - June) or 10 (July - December). Patch is incremental by every build. If there is a breaking change, it should be noted in the readme.


---

[**P3X-SYSTEMD-MANAGER**](https://corifeus.com/systemd-manager) Build v2020.4.160

[![Donate for Corifeus / P3X](https://img.shields.io/badge/Donate-Corifeus-003087.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=QZVM4V6HVZJW6)  [![Contact Corifeus / P3X](https://img.shields.io/badge/Contact-P3X-ff9900.svg)](https://www.patrikx3.com/en/front/contact) [![Like Corifeus @ Facebook](https://img.shields.io/badge/LIKE-Corifeus-3b5998.svg)](https://www.facebook.com/corifeus.software)


## P3X Sponsor

[IntelliJ - The most intelligent Java IDE](https://www.jetbrains.com/?from=patrikx3)

[![JetBrains](https://cdn.corifeus.com/assets/svg/jetbrains-logo.svg)](https://www.jetbrains.com/?from=patrikx3)




[//]: #@corifeus-footer:end
