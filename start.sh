#!/bin/bash

echo "🚀 Starting YExam Development Server..."

# Load environment variables
export DATABASE_URL="postgresql://yexam_admin:admin_pass@localhost:5432/yexam_db?schema=public"
export NEXTAUTH_URL="http://localhost:3000"
export NEXTAUTH_SECRET="your-secret-key-here-change-this-in-production"
export NEXT_PUBLIC_APP_URL="http://localhost:3000"

echo "✅ Environment variables loaded"
echo "🌐 Starting development server on http://localhost:3000"
echo ""
echo "📋 Sample accounts:"
echo "   Admin: admin@yexam.com / admin123"
echo "   Student: student@yexam.com / student123"
echo ""

# Start the development server
npm run dev
