[//]: #@corifeus-header

  [![Build Status](https://travis-ci.org/patrikx3/systemd-manager.svg?branch=master)](https://travis-ci.org/patrikx3/systemd-manager)  [![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/patrikx3/systemd-manager/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/patrikx3/systemd-manager/?branch=master)  [![Code Coverage](https://scrutinizer-ci.com/g/patrikx3/systemd-manager/badges/coverage.png?b=master)](https://scrutinizer-ci.com/g/patrikx3/systemd-manager/?branch=master) 

  
[![NPM](https://nodei.co/npm/p3x-systemd-manager.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/p3x-systemd-manager/)
---

 
# SystemD Manager, watchdog, notifier and service v1.1.571-241  

This is an open source project. Just code. If you like this code, please add a star in GitHub and you really like, you can donate as well. Thanks you so much!

Given, I have my own server, with dynamic IP address, it could happen that the server for about max 5 minutes can not be reachable for the dynamic DNS or very rarely I backup with Clonzilla the SSD or something with the electricity (too much hoovering or cleaning - but I worked on it, so should not happen again), but for some reason, it is not reachable please hang on for 5-30 minutes and it will be back for sure. 

All my domains (patrikx3.com and corifeus.com) could have errors right now, since I am developing in my free time and you can catch glitches, but usually it is stable (imagine updating everything always, which is weird).

### Node Version Requirement 
``` 
>=8.9.0 
```  
   
### Built on Node 
``` 
v9.3.0
```   
   
The ```async``` and ```await``` keywords are required.

Install NodeJs:    
https://nodejs.org/en/download/package-manager/    

undefined

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

```javascript
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

```javascript
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

[**P3X-SYSTEMD-MANAGER**](https://pages.corifeus.com/systemd-manager) Build v1.1.571-241 

[![Like Corifeus @ Facebook](https://img.shields.io/badge/LIKE-Corifeus-3b5998.svg)](https://www.facebook.com/corifeus.software) [![Donate for Corifeus / P3X](https://img.shields.io/badge/Donate-Corifeus-003087.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=LFRV89WPRMMVE&lc=HU&item_name=Patrik%20Laszlo&item_number=patrikx3&currency_code=HUF&bn=PP%2dDonationsBF%3abtn_donate_SM%2egif%3aNonHosted)  [![Contact Corifeus / P3X](https://img.shields.io/badge/Contact-P3X-ff9900.svg)](https://www.patrikx3.com/en/front/contact) 


 

[//]: #@corifeus-footer:end
