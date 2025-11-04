#!/bin/bash

# List of service files to update (excluding ones that don't create entities)
SERVICES=(
  "src/services/areasService.ts"
  "src/services/campersService.ts"
  "src/services/certificationsService.ts"
  "src/services/colorsService.ts"
  "src/services/durationPresetsService.ts"
  "src/services/eventsService.ts"
  "src/services/groupsService.ts"
  "src/services/housingRoomsService.ts"
  "src/services/locationsService.ts"
  "src/services/programsService.ts"
  "src/services/rolesService.ts"
  "src/services/sessionsService.ts"
  "src/services/staffMembersService.ts"
)

for file in "${SERVICES[@]}"; do
  echo "Processing $file..."
  
  # Check if file already has the import
  if ! grep -q "import { getTenantContext }" "$file"; then
    # Add the import after the last import line
    if [[ "$OSTYPE" == "darwin"* ]]; then
      # macOS sed syntax
      sed -i '' '/^import.*from/a\
import { getTenantContext } from "@/utils/tenantContext";
' "$file"
    else
      # Linux sed syntax
      sed -i '/^import.*from/a import { getTenantContext } from "@/utils/tenantContext";' "$file"
    fi
  fi
  
  echo "  ✓ Added import to $file"
done

echo "Done! All service files updated with tenantContext import."
echo "Note: You still need to manually add tenantId and campId to entity creation in each service."

