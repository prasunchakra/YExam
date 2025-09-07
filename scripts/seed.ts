import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@yexam.com' },
    update: {},
    create: {
      email: 'admin@yexam.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // Create sample student
  const studentPassword = await bcrypt.hash('student123', 12);
  const student = await prisma.user.upsert({
    where: { email: 'student@yexam.com' },
    update: {},
    create: {
      email: 'student@yexam.com',
      name: 'Test Student',
      password: studentPassword,
      role: 'STUDENT',
    },
  });

  console.log('👤 Created users');

  // Create exams
  const upscExam = await prisma.exam.upsert({
    where: { id: 'upsc-exam' },
    update: {},
    create: {
      id: 'upsc-exam',
      name: 'UPSC Civil Services Examination',
      description: 'India\'s most prestigious civil services examination',
      category: 'UPSC',
      duration: 180, // 3 hours
      totalMarks: 200,
    },
  });

  const bankingExam = await prisma.exam.upsert({
    where: { id: 'banking-exam' },
    update: {},
    create: {
      id: 'banking-exam',
      name: 'Banking Exams',
      description: 'IBPS, SBI, RBI and other banking sector examinations',
      category: 'Banking',
      duration: 120, // 2 hours
      totalMarks: 200,
    },
  });

  console.log('📚 Created exams');

  // Create subjects
  const generalStudies = await prisma.subject.upsert({
    where: { id: 'general-studies' },
    update: {},
    create: {
      id: 'general-studies',
      name: 'General Studies',
      description: 'General Studies for UPSC',
      examId: upscExam.id,
    },
  });

  const reasoning = await prisma.subject.upsert({
    where: { id: 'reasoning' },
    update: {},
    create: {
      id: 'reasoning',
      name: 'Reasoning Ability',
      description: 'Logical and analytical reasoning',
      examId: bankingExam.id,
    },
  });

  const quantitative = await prisma.subject.upsert({
    where: { id: 'quantitative' },
    update: {},
    create: {
      id: 'quantitative',
      name: 'Quantitative Aptitude',
      description: 'Mathematics and numerical ability',
      examId: bankingExam.id,
    },
  });

  console.log('📖 Created subjects');

  // Create topics
  const historyTopic = await prisma.topic.upsert({
    where: { id: 'history' },
    update: {},
    create: {
      id: 'history',
      name: 'Indian History',
      description: 'Ancient, Medieval, and Modern Indian History',
      subjectId: generalStudies.id,
    },
  });

  const geographyTopic = await prisma.topic.upsert({
    where: { id: 'geography' },
    update: {},
    create: {
      id: 'geography',
      name: 'Indian Geography',
      description: 'Physical and Human Geography of India',
      subjectId: generalStudies.id,
    },
  });

  const verbalReasoning = await prisma.topic.upsert({
    where: { id: 'verbal-reasoning' },
    update: {},
    create: {
      id: 'verbal-reasoning',
      name: 'Verbal Reasoning',
      description: 'Verbal and non-verbal reasoning',
      subjectId: reasoning.id,
    },
  });

  const arithmetic = await prisma.topic.upsert({
    where: { id: 'arithmetic' },
    update: {},
    create: {
      id: 'arithmetic',
      name: 'Arithmetic',
      description: 'Basic arithmetic operations and concepts',
      subjectId: quantitative.id,
    },
  });

  console.log('🏷️ Created topics');

  // Create test papers
  const upscTestPaper = await prisma.testPaper.upsert({
    where: { id: 'upsc-paper-1' },
    update: {},
    create: {
      id: 'upsc-paper-1',
      title: 'UPSC Prelims Mock Test 1',
      description: 'General Studies Paper 1 - Mock Test',
      duration: 120,
      totalMarks: 200,
      subjectId: generalStudies.id,
    },
  });

  const bankingTestPaper = await prisma.testPaper.upsert({
    where: { id: 'banking-paper-1' },
    update: {},
    create: {
      id: 'banking-paper-1',
      title: 'Banking Prelims Mock Test 1',
      description: 'Reasoning and Quantitative Aptitude',
      duration: 120,
      totalMarks: 200,
      subjectId: reasoning.id,
    },
  });

  console.log('📄 Created test papers');

  // Create sections
  const upscSection = await prisma.section.upsert({
    where: { id: 'upsc-section-1' },
    update: {},
    create: {
      id: 'upsc-section-1',
      name: 'General Studies',
      description: 'General Studies questions',
      duration: 120,
      totalMarks: 200,
      testPaperId: upscTestPaper.id,
    },
  });

  const bankingSection = await prisma.section.upsert({
    where: { id: 'banking-section-1' },
    update: {},
    create: {
      id: 'banking-section-1',
      name: 'Reasoning & Quantitative',
      description: 'Reasoning and Quantitative Aptitude questions',
      duration: 120,
      totalMarks: 200,
      testPaperId: bankingTestPaper.id,
    },
  });

  console.log('📋 Created sections');

  // Create sample questions
  const questions = [
    {
      id: 'q1',
      question: 'Who was the first Governor-General of India?',
      type: 'MULTIPLE_CHOICE',
      marks: 2,
      difficulty: 'EASY',
      explanation: 'Warren Hastings was the first Governor-General of India from 1773 to 1785.',
      topicId: historyTopic.id,
      sectionId: upscSection.id,
      options: [
        { text: 'Lord Mountbatten', isCorrect: false },
        { text: 'Warren Hastings', isCorrect: true },
        { text: 'Lord Canning', isCorrect: false },
        { text: 'Lord Dalhousie', isCorrect: false },
      ],
    },
    {
      id: 'q2',
      question: 'Which is the longest river in India?',
      type: 'MULTIPLE_CHOICE',
      marks: 2,
      difficulty: 'EASY',
      explanation: 'The Ganges is the longest river in India with a length of 2,525 km.',
      topicId: geographyTopic.id,
      sectionId: upscSection.id,
      options: [
        { text: 'Yamuna', isCorrect: false },
        { text: 'Ganges', isCorrect: true },
        { text: 'Brahmaputra', isCorrect: false },
        { text: 'Godavari', isCorrect: false },
      ],
    },
    {
      id: 'q3',
      question: 'If 2x + 3 = 11, what is the value of x?',
      type: 'MULTIPLE_CHOICE',
      marks: 2,
      difficulty: 'MEDIUM',
      explanation: '2x + 3 = 11, so 2x = 8, therefore x = 4.',
      topicId: arithmetic.id,
      sectionId: bankingSection.id,
      options: [
        { text: '3', isCorrect: false },
        { text: '4', isCorrect: true },
        { text: '5', isCorrect: false },
        { text: '6', isCorrect: false },
      ],
    },
    {
      id: 'q4',
      question: 'Complete the series: 2, 4, 8, 16, ?',
      type: 'MULTIPLE_CHOICE',
      marks: 2,
      difficulty: 'EASY',
      explanation: 'Each number is multiplied by 2, so 16 × 2 = 32.',
      topicId: verbalReasoning.id,
      sectionId: bankingSection.id,
      options: [
        { text: '24', isCorrect: false },
        { text: '32', isCorrect: true },
        { text: '28', isCorrect: false },
        { text: '20', isCorrect: false },
      ],
    },
  ];

  for (const questionData of questions) {
    const { options, ...questionInfo } = questionData;
    
    const question = await prisma.question.upsert({
      where: { id: questionData.id },
      update: {},
      create: questionInfo,
    });

    // Create options for the question
    for (const option of options) {
      await prisma.option.create({
        data: {
          questionId: question.id,
          text: option.text,
          isCorrect: option.isCorrect,
        },
      });
    }
  }

  console.log('❓ Created sample questions');

  // Enroll student in exams
  await prisma.enrollment.upsert({
    where: {
      userId_examId: {
        userId: student.id,
        examId: upscExam.id,
      }
    },
    update: {},
    create: {
      userId: student.id,
      examId: upscExam.id,
    },
  });

  await prisma.enrollment.upsert({
    where: {
      userId_examId: {
        userId: student.id,
        examId: bankingExam.id,
      }
    },
    update: {},
    create: {
      userId: student.id,
      examId: bankingExam.id,
    },
  });

  console.log('📝 Enrolled student in exams');

  console.log('✅ Database seeding completed!');
  console.log('\n📋 Sample accounts created:');
  console.log('Admin: admin@yexam.com / admin123');
  console.log('Student: student@yexam.com / student123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
