#!/bin/bash

# Wait for asterisk to start
sleep 5

while true; do
  # Fetch SIP accounts from database
  # We use the postgres service name 'postgres' and standard port
  PGPASSWORD=supersecurepassword psql -h postgres -U postgres -d cpaas_db -t -A -F" " -c "SELECT \"Username\", \"Password\" FROM \"SipAccounts\"" > /tmp/accounts.txt 2>/dev/null
  
  if [ $? -eq 0 ]; then
    echo "[transport-udp]" > /etc/asterisk/pjsip.conf
    echo "type=transport" >> /etc/asterisk/pjsip.conf
    echo "protocol=udp" >> /etc/asterisk/pjsip.conf
    echo "bind=0.0.0.0:5060" >> /etc/asterisk/pjsip.conf
    echo "local_net=10.0.0.0/8" >> /etc/asterisk/pjsip.conf
    echo "local_net=172.16.0.0/12" >> /etc/asterisk/pjsip.conf
    echo "local_net=192.168.0.0/16" >> /etc/asterisk/pjsip.conf
    echo "external_media_address=178.62.192.74" >> /etc/asterisk/pjsip.conf
    echo "external_signaling_address=178.62.192.74" >> /etc/asterisk/pjsip.conf
    echo "" >> /etc/asterisk/pjsip.conf
    echo "[transport-tcp]" >> /etc/asterisk/pjsip.conf
    echo "type=transport" >> /etc/asterisk/pjsip.conf
    echo "protocol=tcp" >> /etc/asterisk/pjsip.conf
    echo "bind=0.0.0.0:5060" >> /etc/asterisk/pjsip.conf
    echo "local_net=10.0.0.0/8" >> /etc/asterisk/pjsip.conf
    echo "local_net=172.16.0.0/12" >> /etc/asterisk/pjsip.conf
    echo "local_net=192.168.0.0/16" >> /etc/asterisk/pjsip.conf
    echo "external_media_address=178.62.192.74" >> /etc/asterisk/pjsip.conf
    echo "external_signaling_address=178.62.192.74" >> /etc/asterisk/pjsip.conf
    echo "" >> /etc/asterisk/pjsip.conf

    while read -r username password; do
      # trim whitespace
      username=$(echo "$username" | xargs)
      password=$(echo "$password" | xargs)
      
      if [ -z "$username" ]; then continue; fi
      
      cat >> /etc/asterisk/pjsip.conf <<EOF
[$username]
type=endpoint
context=from-internal
disallow=all
allow=ulaw
allow=alaw
auth=$username
aors=$username
rewrite_contact=yes
rtp_symmetric=yes
force_rport=yes
direct_media=no

[$username]
type=auth
auth_type=userpass
password=$password
username=$username

[$username]
type=aor
max_contacts=1

EOF
    done < /tmp/accounts.txt
    
    # Reload Asterisk PJSIP
    asterisk -rx "pjsip reload" >/dev/null 2>&1
  fi
  
  sleep 10
done
