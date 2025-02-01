[//]: #@corifeus-header

  [![NPM](https://img.shields.io/npm/v/p3x-systemd-manager.svg)](https://www.npmjs.com/package/p3x-systemd-manager)  [![Donate for PatrikX3 / P3X](https://img.shields.io/badge/Donate-PatrikX3-003087.svg)](https://paypal.me/patrikx3) [![Contact Corifeus / P3X](https://img.shields.io/badge/Contact-P3X-ff9900.svg)](https://www.patrikx3.com/en/front/contact) [![Corifeus @ Facebook](https://img.shields.io/badge/Facebook-Corifeus-3b5998.svg)](https://www.facebook.com/corifeus.software)  [![Uptime ratio (90 days)](https://network.corifeus.com/public/api/uptime-shield/31ad7a5c194347c33e5445dbaf8.svg)](https://network.corifeus.com/status/31ad7a5c194347c33e5445dbaf8)





# ⌚ SystemD Manager, watchdog, notifier and service v2025.4.123


  
🌌 **Bugs are evident™ - MATRIX️**  
🚧 **This project is under active development!**  
📢 **We welcome your feedback and contributions.**  
    



### NodeJS LTS is supported

### 🛠️ Built on NodeJs version

```txt
v22.13.1
```





# 📝 Description

                        
[//]: #@corifeus-header:end



Stay informed about the status of your SystemD services with this notification tool. Designed for flexibility, this tool sends notifications (e.g., via email) when specific service states are detected, making it easier to manage and maintain clean and efficient SystemD configurations.

---

## Use Case

Receive email notifications when a SystemD service enters a **failed** state. By enabling boot-time monitoring, the tool can report all failed or "not found" services on startup, allowing you to clean up or remove them from your SystemD configuration effortlessly.

Additionally, you can expand its functionality to track other service states such as **running**, **stopped**, or even monitor **all SystemD changes**. The tool leverages `LoadState` and other properties to trigger actions, enabling notifications or integrations with platforms like Twitter, Facebook, or custom alert systems.

---

## Extensibility

This notifier was initially developed to monitor and alert for failed services on my server via email. However, it is designed for easy customization:

- **Fork & Pull:** Add new features or modify existing ones to suit your needs.
- **Trigger Flexibility:** Configure it to monitor additional service states or actions.
- **Integration:** Expand notifications beyond email (e.g., social platforms or messaging apps).

With its **DBus-based architecture** and **async/await wrappers**, evolving and adapting the tool is straightforward.

---

## Features and Details

This is a lightweight yet robust solution for Linux/Unix/BSD environments (tested on Debian Testing and Ubuntu). Key features include:

- **Email Notifications:** Powered by NodeMailer, receive instant alerts for monitored services.
- **Polling and Event-Based Monitoring:**
  - Default interval-based polling acts as a watchdog.
  - Optional event-based DBus wrappers for real-time service management (ideal for reducing overhead).
- **SystemD Management:** Handle services through DBus, enabling actions triggered by state changes.
- **Clean Startup:** On boot, automatically report failed or missing services for easy maintenance.

This tool is perfect for maintaining server reliability and cleanliness, with the potential to replace traditional watchdogs entirely.

---

Contributions are welcome! Fork the repository, add features, or improve functionality as needed.


## SystemD DBus Manager

References:
[DBus](https://www.freedesktop.org/wiki/Software/systemd/dbus/),
[Node Dbus](https://github.com/Shouqun/node-dbus)

### Prerequisites

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
if (settings === false) {
    return;
}
systemd.boot(settings);
systemd.notifier(settings);
```

#### SystemD Watchdog Notify

This notifies changes in the SystemD via e-mail. Right now it polls, so that it gets all changes. It task about 30-50
milliseconds per run on my 3.3 GHz Pentium 2 cores, not too much. All automatic, requires email and a few tweaks as you
want.

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

```filter.type```: Array, can be empty, actual ```man systemctl``` type. Service is the safest. Not always working when
you fine tune, some are weird.

```nodemailer.config```: Exact nodemailer config, any of that.

```interval, ping```: Uses npm ```milliseconds``` framework for turn into actual milliseconds from a string. This is
for ```Watchdog```, not needed anymore.

```sudo```: for the watchdog either you need to use root, or via sudo (```true|false```). For SystemD needs root, but
you can use another user, and it will use sudo then when polling.

For SystemD DBus notifier you need to use root anyway. I think it cannot do anything else so it's safe to take over the
system, also it's internal, no web interface for now.

```json
{
{
    "debug": false,
    "filter": {
        "type": [
            "service"
        ],
        "exclude": [
            "fwupd-refresh",
            "sysstat-collect",
            "systemd-tmpfiles-clean",
            "ua-timer",
            "phpsessionclean",
            "display-manager",
            "motd-news",
            "sysstat-summary",
            "logrotate",
            "dpkg-db-backup",
            "mdcheck_continue",
            "mdmonitor-oneshot",
            "apt-daily",
            "man-db",
            "packagekit",
            "certbot",
            "user-runtime-dir",
            "user",
            "update-notifier-download"
        ],
        "include": [],
        "trigger": {
            "SubState": [
                "dead",
                "failed"
            ]
        }
    },
    "boot": {
        "enabled": true,
        "trigger": {
            "SubState": [
                "dead",
                "failed"
            ]
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
    },
    "ignoreErrors": [
        "The maximum number of pending replies per connection has been reached",
        "No introspectable"
    ]
}
```

### Weird errors

There are 2 errors that I could not catch or why it happens, so I created a hack:
```js
const settings = {
    "ignoreErrors": [
        "The maximum number of pending replies per connection has been reached",
        "No introspectable"
    ]
}
process.on("unhandledRejection", function (err) {
    if (err && err.message && settings.ignoreErrors.includes(err.message)) {
        console.warn('ignoring error', err)
    } else {
        // user your own logic
        console.error(err)
        process.exit(-1)
    }
});
```

The two error messages:
```txt
"The maximum number of pending replies per connection has been reached"
"No introspectable"
```

[//]: #@corifeus-footer

---

## 🚀 Quick and Affordable Web Development Services

If you want to quickly and affordably develop your next digital project, visit [corifeus.eu](https://corifeus.eu) for expert solutions tailored to your needs.

---

## 🌐 Powerful Online Networking Tool  

Discover the powerful and free online networking tool at [network.corifeus.com](https://network.corifeus.com).  

**🆓 Free**  
Designed for professionals and enthusiasts, this tool provides essential features for network analysis, troubleshooting, and management.  
Additionally, it offers tools for:  
- 📡 Monitoring TCP, HTTP, and Ping to ensure optimal network performance and reliability.  
- 📊 Status page management to track uptime, performance, and incidents in real time with customizable dashboards.  

All these features are completely free to use.  

---

## ❤️ Support Our Open-Source Project  
If you appreciate our work, consider ⭐ starring this repository or 💰 making a donation to support server maintenance and ongoing development. Your support means the world to us—thank you!  

---

### 🌍 About My Domains  
All my domains, including [patrikx3.com](https://patrikx3.com), [corifeus.eu](https://corifeus.eu), and [corifeus.com](https://corifeus.com), are developed in my spare time. While you may encounter minor errors, the sites are generally stable and fully functional.  

---

### 📈 Versioning Policy  
**Version Structure:** We follow a **Major.Minor.Patch** versioning scheme:  
- **Major:** 📅 Corresponds to the current year.  
- **Minor:** 🌓 Set as 4 for releases from January to June, and 10 for July to December.  
- **Patch:** 🔧 Incremental, updated with each build.  

**🚨 Important Changes:** Any breaking changes are prominently noted in the readme to keep you informed.

---


[**P3X-SYSTEMD-MANAGER**](https://corifeus.com/systemd-manager) Build v2025.4.123

 [![NPM](https://img.shields.io/npm/v/p3x-systemd-manager.svg)](https://www.npmjs.com/package/p3x-systemd-manager)  [![Donate for PatrikX3 / P3X](https://img.shields.io/badge/Donate-PatrikX3-003087.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=QZVM4V6HVZJW6)  [![Contact Corifeus / P3X](https://img.shields.io/badge/Contact-P3X-ff9900.svg)](https://www.patrikx3.com/en/front/contact) [![Like Corifeus @ Facebook](https://img.shields.io/badge/LIKE-Corifeus-3b5998.svg)](https://www.facebook.com/corifeus.software)





[//]: #@corifeus-footer:end
