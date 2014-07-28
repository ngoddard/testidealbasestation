apt-get update
apt-get install i2c-tools

echo "" > /etc/modprobe.d/raspi-blacklist.conf
echo "i2c-dev" >> /etc/modules
echo "i2c-bcm2708" >> /etc/modules
