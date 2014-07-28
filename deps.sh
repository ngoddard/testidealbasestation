apt-get update
apt-get install libi2c-dev
cat "" > /etc/modprobe.d/raspi-blacklist.conf
cat "i2c-dev" >> /etc/modules
cat "i2c-bcm2708" >> /etc/modules
