echo "" > /etc/modprobe.d/raspi-blacklist.conf
sleep 5
sudo modprobe i2c-dev
sudo modprobe i2c-bcm2708
sleep 5
sudo modprobe i2c-dev
sudo modprobe i2c-bcm2708
sleep 5
ls /dev/i2c*
cat /etc/modules
sudo i2cdetect -y 1
if [ $? -ne 0 ]; then
    exit 1
fi
node server.js
