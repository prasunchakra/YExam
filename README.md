# YExam - Mock Exam Platform

A comprehensive mock exam platform built with Next.js, designed for students preparing for competitive exams like UPSC, Banking, IIT JEE, NEET, and CAT.

## Features

### For Students
- **Realistic Test Environment**: Experience actual exam conditions with persistent timers and section-wise navigation
- **Instant Results & Analysis**: Get detailed performance reports with percentile, rank, and subject-wise analysis
- **Custom Quiz Builder**: Create personalized practice tests by selecting specific subjects and topics
- **Performance Tracking**: Monitor progress over time with comprehensive analytics and insights
- **Student Dashboard**: Track enrolled courses, test history, and performance metrics

### For Admins
- **Content Management**: Upload and manage exams, subjects, questions, and detailed solutions
- **User Management**: View and manage user data and enrollments
- **Analytics Dashboard**: Monitor platform performance, test attempts, and user engagement
- **Question Bank**: Comprehensive question management system with bulk import capabilities

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd yexam
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/yexam?schema=public"
   
   # NextAuth.js
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   
   # App Configuration
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push database schema
   npm run db:push
   
   # Seed with sample data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Sample Accounts

After running the seed script, you can use these accounts:

- **Admin**: admin@yexam.com / admin123
- **Student**: student@yexam.com / student123

## Project Structure

```
yexam/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Student dashboard
│   ├── admin/             # Admin panel
│   ├── exam/              # Exam interface
│   ├── quiz/              # Quiz builder
│   └── results/           # Results and analysis
├── components/            # Reusable components
├── lib/                   # Utility functions and configurations
├── prisma/                # Database schema and migrations
├── scripts/               # Database seeding scripts
└── public/                # Static assets
```

## Key Features Implementation

### 1. Realistic Exam Interface
- Persistent countdown timer
- Question palette with navigation
- Section-wise test division
- Mark for review functionality
- Auto-submit on time expiry

### 2. Results & Analysis
- Detailed performance reports
- Question-wise review with explanations
- Subject-wise performance analysis
- All-India ranking system
- Accuracy and time management insights

### 3. Custom Quiz Builder
- Subject and topic selection
- Customizable question count and duration
- Personal quiz management
- Integration with main exam system

### 4. Admin Panel
- Comprehensive content management
- User analytics and management
- Question bank administration
- Platform performance monitoring

## Database Schema

The application uses a comprehensive database schema with the following main entities:

- **Users**: Student and admin accounts
- **Exams**: Different exam categories (UPSC, Banking, etc.)
- **Subjects**: Subjects within each exam
- **Topics**: Topics within each subject
- **Test Papers**: Individual test papers
- **Questions**: Questions with multiple choice options
- **Test Attempts**: Student test attempts and results
- **Custom Quizzes**: User-created practice tests

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth.js endpoints

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics

### Exams
- `GET /api/exam/[testPaperId]` - Get test paper
- `POST /api/exam/[testPaperId]/submit` - Submit test

### Results
- `GET /api/results/[attemptId]` - Get test results

### Quiz Builder
- `GET /api/quiz/subjects` - Get available subjects
- `GET /api/quiz/custom` - Get user's custom quizzes
- `POST /api/quiz/custom` - Create custom quiz
- `DELETE /api/quiz/custom/[quizId]` - Delete custom quiz

### Admin
- `GET /api/admin/stats` - Admin dashboard statistics

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema changes
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with sample data

### Database Management

```bash
# Reset database
npx prisma db push --force-reset

# View database
npm run db:studio

# Generate new migration
npx prisma migrate dev --name migration-name
```

## Deployment

### Environment Variables for Production

Make sure to set these environment variables in your production environment:

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Your production URL
- `NEXTAUTH_SECRET` - A secure random string
- `NEXT_PUBLIC_APP_URL` - Your production URL

### Build and Deploy

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository or contact the development team.

---

Built with ❤️ for competitive exam aspirants