-- parse_api_response.lua
-- FreeSWITCH Lua script to parse JSON response from ASP.NET API
-- Called from dialplan after mod_curl fetches tenant config

local json_str = session:getVariable("api_result")

if json_str == nil or json_str == "" then
    freeswitch.consoleLog("ERR", "parse_api_response: No API result received\n")
    session:setVariable("api_status", "error")
    return
end

-- Simple JSON parsing (FreeSWITCH Lua has json module)
local ok, data = pcall(function()
    return JSON:decode(json_str)
end)

if not ok or data == nil then
    freeswitch.consoleLog("ERR", "parse_api_response: Failed to parse JSON: " .. tostring(json_str) .. "\n")
    session:setVariable("api_status", "error")
    return
end

-- Extract fields from the response
-- Expected: {"tenantId":"...","agentId":"...","prompt":"...","provider":"gemini","welcomeMessage":"..."}
if data.error then
    freeswitch.consoleLog("WARN", "parse_api_response: Tenant not found for number\n")
    session:setVariable("api_status", "error")
    return
end

-- Set channel variables for use in dialplan
session:setVariable("api_status", "ok")
session:setVariable("api_tenant_id", tostring(data.tenantId or ""))
session:setVariable("api_agent_id", tostring(data.agentId or ""))
session:setVariable("api_provider", tostring(data.provider or "gemini"))
session:setVariable("api_welcome_message", tostring(data.welcomeMessage or ""))
session:setVariable("api_prompt", tostring(data.prompt or ""))

freeswitch.consoleLog("INFO", string.format(
    "parse_api_response: Tenant=%s, Agent=%s, Provider=%s\n",
    data.tenantId or "?", data.agentId or "?", data.provider or "?"
))
