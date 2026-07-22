using System;

namespace backend.Models
{
    /// <summary>
    /// FreeSWITCH ESL (Event Socket Layer) connection settings
    /// Replaces the legacy AsteriskSettings
    /// </summary>
    public class FreeSwitchSettings
    {
        /// <summary>FreeSWITCH ESL host (e.g. freeswitch-svc.voip-core.svc.cluster.local)</summary>
        public string Host { get; set; } = "localhost";

        /// <summary>ESL port (default: 8021)</summary>
        public int Port { get; set; } = 8021;

        /// <summary>ESL authentication password</summary>
        public string Password { get; set; } = string.Empty;

        /// <summary>FreeSWITCH SIP domain</summary>
        public string Domain { get; set; } = "freeswitch.local";

        /// <summary>External SIP profile name (e.g. "external")</summary>
        public string ExternalProfile { get; set; } = "external";

        /// <summary>Full ESL address: host:port</summary>
        public string Address => $"{Host}:{Port}";
    }
}
