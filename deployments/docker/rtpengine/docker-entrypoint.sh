#!/bin/bash
set -e

# Auto-detect primary network interface IP for RTP
INTERFACE_IP=$(ip route get 1 | awk '{print $7; exit}')
echo "rtpengine: Detected interface IP: $INTERFACE_IP"

# Replace placeholder in config
sed -i "s/DETECTED_INTERFACE/$INTERFACE_IP/" /etc/rtpengine/rtpengine.conf

# Load kernel module if available (for best performance)
if modprobe xt_RTPENGINE 2>/dev/null; then
    echo "rtpengine: Kernel module loaded successfully"
else
    echo "rtpengine: Kernel module not available, running in userspace mode"
fi

# Start rtpengine
exec rtpengine --config-file=/etc/rtpengine/rtpengine.conf "$@"
