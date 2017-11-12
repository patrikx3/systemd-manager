#!/usr/bin/env bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
npm install corifeus-utils
node $DIR/preinstall.js