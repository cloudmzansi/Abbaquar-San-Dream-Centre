#!/bin/bash

# Update all input placeholders in HomeContactForm.tsx
sed -i '' 's/bg-white\/10 border rounded-xl/bg-white\/10 border rounded-xl placeholder-white\/60/g' src/components/HomeContactForm.tsx

echo "Placeholder colors updated!"
