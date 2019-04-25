#!/bin/bash
 
cd /home/ubuntu/testServer/ 
npm install
pm2 start index.js
