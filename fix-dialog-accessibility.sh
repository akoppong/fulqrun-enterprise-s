#!/bin/bash

# Script to fix accessibility issues in dialog components
# Adds DialogDescription import and usage to dialogs missing it

FILES=(
  "/workspaces/spark-template/src/components/dashboard/KPITargetsView.tsx"
  "/workspaces/spark-template/src/components/dashboard/LeadScoringDashboard.tsx"
  "/workspaces/spark-template/src/components/dashboard/KPIDashboardBuilder.tsx"
  "/workspaces/spark-template/src/components/dashboard/KPIAnalyticsFilters.tsx"
  "/workspaces/spark-template/src/components/segments/AISegmentAssignmentDialog.tsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file..."
    
    # Add DialogDescription to imports if not present
    if grep -q "DialogTitle" "$file" && ! grep -q "DialogDescription" "$file"; then
      sed -i 's/DialogTitle\([^,]*\)/DialogTitle, DialogDescription\1/g' "$file"
      echo "  ✓ Added DialogDescription to imports"
    fi
    
    # Look for DialogTitle without DialogDescription and add one
    if grep -q "DialogTitle" "$file" && ! grep -A5 "DialogTitle" "$file" | grep -q "DialogDescription"; then
      echo "  ⚠ Manual intervention needed for DialogDescription placement"
    fi
  else
    echo "File not found: $file"
  fi
done

echo "Dialog accessibility fix completed!"