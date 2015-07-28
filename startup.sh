echo "" > /etc/modprobe.d/raspi-blacklist.conf

echo " uninstalling i2c" > deps.log
dpkg -r i2c-tools >> deps.log
echo " installing i2c" >> deps.log
dpkg -i i2c-tools_3.1.1-1_armhf.deb >> deps.log
echo " deps.sh done" >> deps.log
sleep 5
modprobe -r w1-gpio
sleep 5
sudo modprobe i2c-dev
sudo modprobe i2c-bcm2708
sleep 5
sudo modprobe i2c-dev
sudo modprobe i2c-bcm2708
sleep 5
ls /dev/i2c*
cat /etc/modules
lsmod
sudo i2cdetect -y 1
#if [ $? -ne 0 ]; then
#    shutdown -r now
#fi
node server.js
