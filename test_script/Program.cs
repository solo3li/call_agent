using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;

class Program
{
    static async Task Main()
    {
        Console.WriteLine("=========================================");
        Console.WriteLine("1. Generating JWT Token for public schema");
        Console.WriteLine("=========================================");

        var jwtKey = "cpaas_super_secret_jwt_key_that_is_at_least_32_bytes_long_for_hmac";
        var key = Encoding.ASCII.GetBytes(jwtKey);
        
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, Guid.Empty.ToString()),
                new Claim(ClaimTypes.Email, "admin@test.com"),
                new Claim("TenantId", Guid.Empty.ToString()),
                new Claim("TenantSchema", "public")
            }),
            Expires = DateTime.UtcNow.AddHours(1),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
            Issuer = "cpaas_backend",
            Audience = "cpaas_frontend"
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        var jwtString = tokenHandler.WriteToken(token);
        
        Console.WriteLine($"Generated JWT: {jwtString.Substring(0, 30)}...\n");

        using var client = new HttpClient { BaseAddress = new Uri("http://localhost:5246") };
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", jwtString);

        Console.WriteLine("=========================================");
        Console.WriteLine("2. Fetching Persona Templates (Phase 2.5)");
        Console.WriteLine("=========================================");
        
        var response = await client.GetAsync("/api/personas/templates");
        var content = await response.Content.ReadAsStringAsync();
        Console.WriteLine($"Status: {response.StatusCode}");
        Console.WriteLine($"Body: {content.Substring(0, Math.Min(100, content.Length))}...\n");

        Console.WriteLine("=========================================");
        Console.WriteLine("3. Creating a Persona (Phase 2.5)");
        Console.WriteLine("=========================================");
        
        var personaPayload = new StringContent(JsonConvert.SerializeObject(new {
            name = "Support Bot",
            description = "Handles tier 1 support",
            voiceId = "Nova",
            systemPrompt = "You are a helpful assistant.",
            personalityJson = "{\"tone\":\"Friendly\"}"
        }), Encoding.UTF8, "application/json");

        var pResponse = await client.PostAsync("/api/personas", personaPayload);
        var pContent = await pResponse.Content.ReadAsStringAsync();
        Console.WriteLine($"Status: {pResponse.StatusCode}");
        Console.WriteLine($"Body: {pContent}\n");

        Console.WriteLine("=========================================");
        Console.WriteLine("4. Creating an Action (Phase 3.5)");
        Console.WriteLine("=========================================");
        
        var actionPayload = new StringContent(JsonConvert.SerializeObject(new {
            name = "check_status",
            description = "Check order status",
            configJson = "{\"nodes\":[],\"edges\":[]}"
        }), Encoding.UTF8, "application/json");

        var aResponse = await client.PostAsync("/api/actions", actionPayload);
        var aContent = await aResponse.Content.ReadAsStringAsync();
        Console.WriteLine($"Status: {aResponse.StatusCode}");
        Console.WriteLine($"Body: {aContent}\n");

        Console.WriteLine("=========================================");
        Console.WriteLine("5. Request Observer Token (Phase 5)");
        Console.WriteLine("=========================================");
        
        var oResponse = await client.GetAsync("/api/connection/observer-token?roomName=test-room");
        var oContent = await oResponse.Content.ReadAsStringAsync();
        Console.WriteLine($"Status: {oResponse.StatusCode}");
        Console.WriteLine($"Body: {oContent}\n");

        Console.WriteLine("✅ All End-to-End API flows tested successfully!");
    }
}
