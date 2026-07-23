FROM opensips/opensips:3.5

# Install extra modules needed for CPaaS + envsubst for env var substitution
RUN apt-get update && apt-get install -y \
    opensips-postgres-module \
    opensips-http-modules \
    opensips-json-module \
    opensips-tls-module \
    opensips-auth-modules \
    gettext-base \
    && rm -rf /var/lib/apt/lists/*

# Copy config files
COPY opensips.cfg /etc/opensips/opensips.cfg
COPY dispatcher.list /etc/opensips/dispatcher.list

# Entrypoint that substitutes env vars before starting
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 5060/udp
EXPOSE 5060/tcp
EXPOSE 8888/tcp

ENTRYPOINT ["/docker-entrypoint.sh"]
