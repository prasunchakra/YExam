import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { testPaperId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const testPaperId = params.testPaperId;
    const { answers, timeSpent } = await request.json();

    const userId = session.user.id;

    // Get test paper details
    const testPaper = await prisma.testPaper.findUnique({
      where: { id: testPaperId },
      include: {
        sections: {
          include: {
            questions: {
              include: {
                options: true,
              },
            },
          },
        },
      },
    });

    if (!testPaper) {
      return NextResponse.json({ message: "Test paper not found" }, { status: 404 });
    }

    // Create test attempt
    const testAttempt = await prisma.testAttempt.create({
      data: {
        userId,
        testPaperId,
        timeSpent: Math.round(timeSpent / 60), // Convert to minutes
        isCompleted: true,
        submittedAt: new Date(),
      },
    });

    let totalMarks = 0;
    let obtainedMarks = 0;

    // Process answers and calculate scores
    const answerRecords = [];
    for (const [questionId, selectedOptionId] of Object.entries(answers)) {
      const question = testPaper.sections
        .flatMap(section => section.questions)
        .find(q => q.id === questionId);

      if (!question) continue;

      const selectedOption = question.options.find(opt => opt.id === selectedOptionId);
      const isCorrect = selectedOption?.isCorrect || false;
      const marksObtained = isCorrect ? question.marks : 0;

      totalMarks += question.marks;
      obtainedMarks += marksObtained;

      answerRecords.push({
        testAttemptId: testAttempt.id,
        questionId,
        selectedOption: selectedOptionId,
        isCorrect,
        marksObtained,
      });
    }

    // Create answer records
    await prisma.answer.createMany({
      data: answerRecords,
    });

    // Calculate percentage
    const percentage = totalMarks > 0 ? Math.round((obtainedMarks / totalMarks) * 100 * 100) / 100 : 0;

    // Get all attempts for this test paper to calculate rank
    const allAttempts = await prisma.testAttempt.findMany({
      where: {
        testPaperId,
        isCompleted: true,
      },
      orderBy: {
        percentage: 'desc',
      },
    });

    const rank = allAttempts.findIndex(attempt => attempt.id === testAttempt.id) + 1;

    // Update test attempt with final scores
    await prisma.testAttempt.update({
      where: { id: testAttempt.id },
      data: {
        totalMarks,
        obtainedMarks,
        percentage,
        rank,
      },
    });

    return NextResponse.json({
      attemptId: testAttempt.id,
      totalMarks,
      obtainedMarks,
      percentage,
      rank,
    });
  } catch (error) {
    console.error("Error submitting test:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
