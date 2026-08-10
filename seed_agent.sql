-- Seed AI Agent and Phone Number for Testing

-- 1. Create a Persona
INSERT INTO tenant_6a5729964290."Personas" (
    "Id", "Name", "AvatarUrl", "Description", "VoiceId", "Language", 
    "Provider", "ModelName", "SystemPrompt", "PersonalityJson", 
    "BehaviorRulesJson", "IsActive", "Version", "CreatedAt"
) VALUES (
    '50000000-0000-0000-0000-000000000001',
    'Test Persona',
    'https://example.com/avatar.png',
    'A test persona for the AI Agent',
    'en-US-Standard-A',
    'en-US',
    'gemini',
    'gemini-1.5-flash',
    'You are a helpful AI assistant.',
    '{}',
    '{}',
    true,
    1,
    NOW()
);

-- 2. Create an AI Agent
INSERT INTO tenant_6a5729964290."Agents" (
    "Id", "Name", "PersonaId", "IsActive", "CreatedAt"
) VALUES (
    '60000000-0000-0000-0000-000000000001',
    'Test Agent',
    '50000000-0000-0000-0000-000000000001',
    true,
    NOW()
);

-- 3. Create a Phone Number mapped to the AI Agent
INSERT INTO public.phone_numbers (
    "Id", "TenantId", "Number", "AiAgentId", "CreatedAt"
) VALUES (
    '70000000-0000-0000-0000-000000000001',
    '08c16551-cbcd-49bb-b71a-c1745e86cff1',
    '1001234567',
    '60000000-0000-0000-0000-000000000001',
    NOW()
);
