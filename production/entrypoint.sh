#!/bin/sh

export METEOR_SETTINGS="$(node env.js)"

exec node main.js
