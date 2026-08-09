import os
import re

directory = '/root/callagent/call_agent/backend/Controllers'
exclude = ['AuthController.cs', 'InternalController.cs']

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Replace AppDbContext with TenantDbContext
    content = content.replace('AppDbContext', 'TenantDbContext')

    # Remove var tenantIdStr = User.FindFirstValue("TenantId");
    # if (!Guid.TryParse(tenantIdStr, out var tenantId)) return Unauthorized();
    content = re.sub(r'\s*var tenantIdStr = User\.FindFirstValue\("TenantId"\);\s*if \(\!Guid\.TryParse\(tenantIdStr, out var tenantId\)\)\s*return Unauthorized\(\);\s*', '\n            ', content)
    
    # Remove assignments like item.TenantId = tenantId;
    content = re.sub(r'\s*[a-zA-Z0-9_]+\.TenantId = tenantId;\s*', '\n            ', content)

    # Remove .Where(a => a.TenantId == tenantId) entirely
    content = re.sub(r'\.Where\([a-zA-Z0-9_]+ => [a-zA-Z0-9_]+\.TenantId == tenantId\)', '', content)

    # Remove && a.TenantId == tenantId
    content = re.sub(r'\s*&&\s*[a-zA-Z0-9_]+\.TenantId == tenantId', '', content)
    
    # Remove a.TenantId == tenantId && 
    content = re.sub(r'[a-zA-Z0-9_]+\.TenantId == tenantId\s*&&\s*', '', content)
    
    # Fix remaining a => a.TenantId == tenantId which wasn't part of &&
    content = re.sub(r'([a-zA-Z0-9_]+) => \1\.TenantId == tenantId', '', content)

    with open(filepath, 'w') as f:
        f.write(content)

for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith('.cs') and file not in exclude:
            process_file(os.path.join(root, file))

# Also process ApiKeyAuthenticationHandler
auth_handler = '/root/callagent/call_agent/backend/Security/ApiKeyAuthenticationHandler.cs'
if os.path.exists(auth_handler):
    with open(auth_handler, 'r') as f:
        content = f.read()
    content = content.replace('AppDbContext', 'TenantDbContext')
    with open(auth_handler, 'w') as f:
        f.write(content)
