#!/bin/sh

cd /home/ubuntu/testServer/ 
npm install
pm2 start /home/ubuntu/testServer/index.js -f
