# Install required packages
sudo apt-get update
sudo apt-get install -y \
  xserver-xorg \
  x11-xserver-utils \
  nodejs \
  npm

# Set permissions for X server access
xhost +local:root