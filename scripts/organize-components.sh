#!/bin/bash

# Create new directory structure
mkdir -p src/components/{layout,features,shared,ui}

# Move components to their respective directories
# Layout components
mv src/components/Header.tsx src/components/layout/
mv src/components/Footer.tsx src/components/layout/
mv src/components/Navigation.tsx src/components/layout/

# Feature components
mv src/components/Activities.tsx src/components/features/
mv src/components/Contact.tsx src/components/features/
mv src/components/Donate.tsx src/components/features/
mv src/components/Gallery.tsx src/components/features/
mv src/components/UpcomingEvents.tsx src/components/features/

# Shared components
mv src/components/ErrorBoundary.tsx src/components/shared/
mv src/components/optimized-image.tsx src/components/shared/

# UI components (already in place)
# These are already in the correct location at src/components/ui/

echo "Components reorganized successfully!" 