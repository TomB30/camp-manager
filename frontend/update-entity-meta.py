#!/usr/bin/env python3
import re
import os
import sys

def add_tenant_context_to_create(content):
    """Add getTenantContext and inject tenantId/campId into create functions"""
    
    # Pattern to find create functions that build new entities
    # Looking for: meta: { id: crypto.randomUUID(), name: ...
    pattern = r'(const \w+(?:Entity|Activity|Area|Camper|Certification|Color|DurationPreset|Event|Group|HousingRoom|Location|Program|Role|Session|StaffMember)?\s*(?:=|:.*=)\s*{[\s\S]*?meta:\s*{\s*)(id:\s*crypto\.randomUUID\(\),)'
    
    def replacer(match):
        prefix = match.group(1)
        id_line = match.group(2)
        
        # Check if tenantId already exists
        if 'tenantId' in prefix or 'campId' in prefix:
            return match.group(0)  # Already has tenant context
        
        # Add getTenantContext() call before the entity creation
        lines_before = prefix.rsplit('\n', 1)
        if len(lines_before) > 1:
            indent = len(lines_before[1]) - len(lines_before[1].lstrip())
            context_line = ' ' * (indent - 2) + 'const { tenantId, campId } = getTenantContext();\n'
            new_prefix = lines_before[0] + '\n' + context_line + lines_before[1]
        else:
            new_prefix = '  const { tenantId, campId } = getTenantContext();\n' + prefix
        
        # Add tenantId and campId after id
        new_id_section = id_line + '\n      tenantId,\n      campId,'
        
        return new_prefix + new_id_section
    
    return re.sub(pattern, replacer, content)

def add_tenant_context_to_update(content):
    """Preserve tenantId/campId in update functions"""
    
    # Pattern for update functions that rebuild the entity
    # Looking for: meta: { id: existing...id, name: ...
    pattern = r'(meta:\s*{\s*id:\s*\w+\.meta\.id,)(\s*name:)'
    
    def replacer(match):
        id_part = match.group(1)
        name_part = match.group(2)
        
        # Check if tenantId already exists
        if 'tenantId' in id_part:
            return match.group(0)
        
        # Add tenantId and campId preservation
        return id_part + '\n      tenantId: existing' + '.meta.tenantId,\n      campId: existing' + '.meta.campId,' + name_part
    
    # Try different variable names for existing entity
    result = content
    for var_name in ['existing', 'existingEntity', 'current', 'entity']:
        pattern_specific = pattern.replace('existing', var_name)
        if re.search(pattern_specific, result):
            result = re.sub(pattern_specific, lambda m: replacer(m), result)
    
    return result

def process_file(filepath):
    """Process a single service file"""
    try:
        with open(filepath, 'r') as f:
            content = f.read()
        
        original_content = content
        
        # Add tenant context to create operations
        content = add_tenant_context_to_create(content)
        
        # Add tenant context to update operations
        # content = add_tenant_context_to_update(content)
        
        if content != original_content:
            with open(filepath, 'w') as f:
                f.write(content)
            print(f"✓ Updated {filepath}")
            return True
        else:
            print(f"- No changes needed for {filepath}")
            return False
    except Exception as e:
        print(f"✗ Error processing {filepath}: {e}")
        return False

def main():
    base_dir = "src/services"
    
    service_files = [
        "areasService.ts",
        "campersService.ts",
        "certificationsService.ts",
        "colorsService.ts",
        "durationPresetsService.ts",
        "eventsService.ts",
        "groupsService.ts",
        "housingRoomsService.ts",
        "locationsService.ts",
        "programsService.ts",
        "rolesService.ts",
        "sessionsService.ts",
        "staffMembersService.ts",
    ]
    
    updated_count = 0
    for filename in service_files:
        filepath = os.path.join(base_dir, filename)
        if os.path.exists(filepath):
            if process_file(filepath):
                updated_count += 1
        else:
            print(f"! File not found: {filepath}")
    
    print(f"\n{updated_count} files updated.")

if __name__ == "__main__":
    main()

