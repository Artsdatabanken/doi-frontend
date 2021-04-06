#!/bin/bash
mkdir dump
rsync -avr --exclude='*.sh' --exclude='*.yml' --exclude='/dump' . dump
echo "Making archive"
tar --directory=dump -zcf dump.tar.gz .
ls -l
sshpass -p $scp_pass scp -v -o StrictHostKeyChecking=no dump.tar.gz $scp_user@$scp_dest/
curl -X POST -H 'Content-type: application/json' --data '{"text":"deploy doi-frontend"}' $slackaddy