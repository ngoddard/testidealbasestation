apt-get update
apt-get install libi2c-dev
git clone git://git.drogon.net/wiringPi
cd wiringPi
git pull origin
./build
gpio readall
gpio load i2c
