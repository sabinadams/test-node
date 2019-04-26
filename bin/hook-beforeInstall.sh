#!/bin/bash

pm2 stop index
cd /home/ubuntu/testServer
sudo rm -rf node_modules npm-debug.log
