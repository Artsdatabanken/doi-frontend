#!/bin/bash
mkdir dump
rsync -avr --exclude='*.sh' --exclude='*.yml' --exclude='/dump' . dump
curl -X POST -H 'Content-type: application/json' --data '{"text":"deploy doi-frontend"}' $slackaddy