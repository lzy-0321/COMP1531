#!/usr/bin/env bash

WORKING_DIRECTORY="~/www/cs1531deploy"

USERNAME="godel"
SSH_HOST="ssh-godel.alwaysdata.net"

scp -r ./package.json ./package-lock.json ./tsconfig.json ./src ./profile-pics "$USERNAME@$SSH_HOST:$WORKING_DIRECTORY"
ssh "$USERNAME@$SSH_HOST" "cd $WORKING_DIRECTORY && npm install --omit=dev"
