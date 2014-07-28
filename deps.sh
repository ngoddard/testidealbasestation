apt-get update
apt-get install libi2c-dev
wget https://raw.github.com/hamishcunningham/wiringpi/master/package/2.13/unstable/wiringpi_2.13_armhf.deb
dpkg -i ./wiringpi_2.13_armhf.deb
gpio load i2c
