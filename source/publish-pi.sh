#!/bin/bash
rm -Rf staging
rm staging.zip
cp -R pi_client staging
rm -Rf staging/__pycache__/
rm staging/*dummy*
mv staging/settings.yaml staging/settings.template.yaml
zip -r staging.zip staging/
rm -Rf staging
scp staging.zip activate-pi.sh pi@fogpi-1-001:/home/pi/
scp staging.zip activate-pi.sh pi@fogpi-1-002:/home/pi/
scp staging.zip activate-pi.sh pi@fogpi-1-003:/home/pi/
scp staging.zip activate-pi.sh pi@fogpi-1-004:/home/pi/
rm staging.zip