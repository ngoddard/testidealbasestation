sleep 40
echo "apt-get updating..." >> deps.log
apt-get update
echo "apt-get removing i2ctools..." >> deps.log
apt-get --assume-yes remove i2ctools
echo "apt-get installing i2ctools..." >> deps.log
apt-get --assume-yes install i2c-tools
#
#cat /etc/modprobe.d/raspi-blacklist.conf
#echo "" > /etc/modprobe.d/raspi-blacklist.conf
#cat /etc/modules
#echo "i2c-dev" >> /etc/modules
#echo "i2c-bcm2708" >> /etc/modules
