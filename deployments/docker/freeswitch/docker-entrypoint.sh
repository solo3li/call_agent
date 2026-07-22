#!/bin/bash
set -e

echo "FreeSWITCH CPaaS: Starting initialization..."

# Detect external IP if not set
if [ -z "$EXT_SIP_IP" ]; then
    EXT_SIP_IP=$(curl -s http://checkip.amazonaws.com/ 2>/dev/null || ip route get 1 | awk '{print $7; exit}')
    export EXT_SIP_IP
    echo "FreeSWITCH: Detected external IP: $EXT_SIP_IP"
fi

# Set defaults
export FREESWITCH_DOMAIN=${FREESWITCH_DOMAIN:-"freeswitch.cpaas.local"}
export ESL_PASSWORD=${ESL_PASSWORD:-"changeme_esl_password"}
export BACKEND_API_URL=${BACKEND_API_URL:-"http://backend-api.control-plane.svc.cluster.local:8080"}
export SIP_TRUNK_HOST=${SIP_TRUNK_HOST:-"sip.trunk.example.com"}

echo "FreeSWITCH: Domain=$FREESWITCH_DOMAIN"
echo "FreeSWITCH: Backend API=$BACKEND_API_URL"
echo "FreeSWITCH: ESL listening on :8021"

# Start FreeSWITCH
exec "$@"
