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
    }
}
