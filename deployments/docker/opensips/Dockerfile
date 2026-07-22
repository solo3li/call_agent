FROM opensips/opensips:3.5

# Install extra modules needed for CPaaS
RUN apt-get update && apt-get install -y \
    opensips-postgres-module \
    opensips-http-modules \
    opensips-json-module \
    opensips-tls-module \
    && rm -rf /var/lib/apt/lists/*

# Copy config files
COPY opensips.cfg /etc/opensips/opensips.cfg
COPY dispatcher.list /etc/opensips/dispatcher.list

EXPOSE 5060/udp
EXPOSE 5060/tcp
EXPOSE 8888/tcp

CMD ["opensips", "-FE", "-f", "/etc/opensips/opensips.cfg"]
