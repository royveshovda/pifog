#!/bin/bash
rm -Rf staging
unzip staging.zip
if [ ! -f ./pifog/settings.yaml ]; then
    mv ./staging/settings.template.yaml ./staging/settings.yaml
else
    cp ./pifog/settings.yaml ./staging/settings.yaml
fi

sudo systemctl stop pifog
sudo rm -Rf pifog
mv staging pifog
sudo systemctl start pifog