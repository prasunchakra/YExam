#!/bin/bash

echo "🚀 Setting up YExam Mock Exam Platform..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << EOF
# Database
DATABASE_URL="postgresql://yexam_admin:admin_pass@localhost:5432/yexam_db?schema=public"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-this-in-production"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
EOF
    echo "⚠️  Please update the DATABASE_URL in .env.local with your PostgreSQL credentials"
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run db:generate

# Push database schema
echo "🗄️  Setting up database schema..."
npm run db:push

# Seed database
echo "🌱 Seeding database with sample data..."
npm run db:seed

echo ""
echo "✅ Setup completed successfully!"
echo ""
echo "📋 Sample accounts created:"
echo "   Admin: admin@yexam.com / admin123"
echo "   Student: student@yexam.com / student123"
echo ""
echo "🚀 Start the development server with:"
echo "   npm run dev"
echo ""
echo "🌐 Open http://localhost:3000 in your browser"
echo ""
echo "📚 Check README.md for detailed documentation"
