#!/bin/bash
mkdir dump
rsync -avr --exclude='*.sh' --exclude='*.yml' --exclude='/dump' --exclude='node_modules' --exclude='README.md' . dump
echo "Making archive"
tar --directory=dump -zcf dump.tar.gz .
echo "Is there anybody out there?"
ls -l
sshpass -p $scp_pass scp -v -o StrictHostKeyChecking=no dump.tar.gz $scp_user@$scp_dest/
curl -X POST -H 'Content-type: application/json' --data '{"text":"deploy doi-frontend"}' $slackaddy