#!/bin/bash

# Update the input fields in Contact.tsx
sed -i '' 's/rounded focus:outline-none/rounded-xl focus:outline-none/g' src/components/Contact.tsx

# Update the navbar buttons in Header.tsx
sed -i '' 's/rounded-lg hover:bg-white/rounded-xl hover:bg-white/g' src/components/Header.tsx

# Update all form inputs to use rounded-xl
find src -type f -name "*.tsx" -exec sed -i '' 's/rounded-md/rounded-xl/g' {} \;

echo "Style updates completed!"
