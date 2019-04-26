#!/bin/sh

cd /home/ubuntu/testServer/ 
npm install
pm2 start index.js -f
