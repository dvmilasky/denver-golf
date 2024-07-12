#!/bin/bash

echo "Installing git and NVM"
sudo yum install git;
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

echo "Installing LTS Node"
nvm install --lts

echo "Cloning Repo"
git clone https://github.com/dvmilasky/denver-golf.git

node ./src/server.js