using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using backend.Models;
using Microsoft.Extensions.Options;

namespace backend.Services
{
    public class AriRestService
    {
        private readonly HttpClient _httpClient;
        private readonly AsteriskSettings _settings;
        private readonly ILogger<AriRestService> _logger;

        public AriRestService(HttpClient httpClient, IOptions<AsteriskSettings> settings, ILogger<AriRestService> logger)
        {
            _httpClient = httpClient;
            _settings = settings.Value;
            _logger = logger;

            var authValue = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{_settings.Username}:{_settings.Password}"));
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", authValue);
            _httpClient.BaseAddress = new Uri(_settings.BaseUrl + "/");
        }

        public async Task AnswerCallAsync(string channelId)
        {
            try
            {
                var response = await _httpClient.PostAsync($"channels/{channelId}/answer", null);
                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation("Successfully answered channel {ChannelId}", channelId);
                }
                else
                {
                    _logger.LogWarning("Failed to answer channel {ChannelId}. Status: {StatusCode}", channelId, response.StatusCode);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error answering channel {ChannelId}", channelId);
            }
        }

        public async Task PlayMediaAsync(string channelId, string media)
        {
            try
            {
                // e.g. media = "sound:hello-world"
                var url = $"channels/{channelId}/play?media={media}";
                var response = await _httpClient.PostAsync(url, null);
                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation("Successfully started playing {Media} on channel {ChannelId}", media, channelId);
                }
                else
                {
                    var error = await response.Content.ReadAsStringAsync();
                    _logger.LogWarning("Failed to play media on channel {ChannelId}. Error: {Error}", channelId, error);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error playing media on channel {ChannelId}", channelId);
            }
        }

        public async Task HangupCallAsync(string channelId)
        {
            try
            {
                var response = await _httpClient.DeleteAsync($"channels/{channelId}");
                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation("Successfully hung up channel {ChannelId}", channelId);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error hanging up channel {ChannelId}", channelId);
            }
        }

        public async Task<string?> CreateExternalMediaChannelAsync(string app, string externalHost)
        {
            try
            {
                var content = new StringContent(string.Empty);
                var url = $"channels/externalMedia?app={app}&external_host={externalHost}&format=ulaw";
                var response = await _httpClient.PostAsync(url, content);
                
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    using var doc = JsonDocument.Parse(json);
                    var channelId = doc.RootElement.GetProperty("id").GetString();
                    _logger.LogInformation("Created ExternalMedia channel {ChannelId} pointing to {Host}", channelId, externalHost);
                    return channelId;
                }
                else
                {
                    _logger.LogWarning("Failed to create external media channel: {Error}", await response.Content.ReadAsStringAsync());
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating external media channel");
            }
            return null;
        }

        public async Task BridgeChannelsAsync(string channelId1, string channelId2)
        {
            try
            {
                // First create a bridge
                var bridgeResponse = await _httpClient.PostAsync("bridges", new StringContent(string.Empty));
                if (bridgeResponse.IsSuccessStatusCode)
                {
                    var json = await bridgeResponse.Content.ReadAsStringAsync();
                    using var doc = JsonDocument.Parse(json);
                    var bridgeId = doc.RootElement.GetProperty("id").GetString();

                    // Then add channels to the bridge
                    var url = $"bridges/{bridgeId}/addChannel?channel={channelId1},{channelId2}";
                    await _httpClient.PostAsync(url, new StringContent(string.Empty));
                    _logger.LogInformation("Bridged channels {C1} and {C2} via bridge {BridgeId}", channelId1, channelId2, bridgeId);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error bridging channels");
            }
        }
    }
}
