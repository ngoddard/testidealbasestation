modprobe i2c-dev
modprobe i2c-bcm2708
cat /etc/modules
sudo i2cdetect -y 1
node server.js
