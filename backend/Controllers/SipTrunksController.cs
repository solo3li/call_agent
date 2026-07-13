using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace backend.Controllers
{
    [Authorize(AuthenticationSchemes = "ApiKey")]
    [ApiController]
    [Route("api/sip-trunks")]
    public class SipTrunksController : ControllerBase
    {
        public class CreateSipTrunkRequestDto
        {
            public string InboundNumber { get; set; } = string.Empty;
            public string SipHost { get; set; } = string.Empty;
            public string Username { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }

        [HttpPost]
        public ActionResult CreateSipTrunk([FromBody] CreateSipTrunkRequestDto request)
        {
            var tenantIdStr = User.FindFirstValue("TenantId");
            if (!Guid.TryParse(tenantIdStr, out var tenantId))
                return Unauthorized();

            // Here we would use LiveKit Server SDK to create a SIP Trunk profile dynamically
            // and save to our database.
            
            return Ok(new { success = true, message = $"SIP Trunk for {request.InboundNumber} created successfully." });
        }
    }
}
