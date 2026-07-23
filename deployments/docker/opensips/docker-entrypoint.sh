#!/bin/sh
set -e

# Substitute environment variables in opensips.cfg
# This replaces ${OPENSIPS_DB_HOST}, ${OPENSIPS_DB_PASS} etc.
cfg_src="/etc/opensips/opensips.cfg"
cfg_tmp="/tmp/opensips.cfg"

echo "OpenSIPS: Substituting environment variables..."
echo "OpenSIPS: DB_HOST=${OPENSIPS_DB_HOST}"

envsubst '${OPENSIPS_DB_HOST} ${OPENSIPS_DB_PASS}' < "$cfg_src" > "$cfg_tmp"
cp "$cfg_tmp" "$cfg_src"

echo "OpenSIPS: Starting..."
exec opensips -F -f /etc/opensips/opensips.cfg
