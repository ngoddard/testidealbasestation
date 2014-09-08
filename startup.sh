sleep 5
modprobe i2c-dev
modprobe i2c-bcm2708
sleep 5
modprobe i2c-dev
modprobe i2c-bcm2708
sleep 5
cat /etc/modules
sudo i2cdetect -y 1
if [ $? -ne 0 ]; then
    exit 1
fi
node server.js
