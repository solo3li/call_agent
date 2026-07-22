FROM safarov/freeswitch:latest

# Create required directories (if missing)
RUN mkdir -p /etc/freeswitch /var/log/freeswitch /var/lib/freeswitch/recordings

# Copy all config files

COPY conf/ /etc/freeswitch/

# Copy entrypoint
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# SIP ports: 5060 (internal), 5080 (external/trunk)
# ESL port: 8021
EXPOSE 5060/udp 5060/tcp
EXPOSE 5080/udp 5080/tcp
EXPOSE 8021/tcp

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD fs_cli -x "status" | grep -q "UP" || exit 1

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["freeswitch", "-nonat", "-nf"]
