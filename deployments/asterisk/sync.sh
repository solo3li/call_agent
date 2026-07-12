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
