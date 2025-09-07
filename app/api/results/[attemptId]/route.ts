import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { attemptId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const attemptId = params.attemptId;

    const testAttempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
      include: {
        testPaper: {
          include: {
            subject: {
              include: {
                exam: true,
              },
            },
          },
        },
        answers: {
          include: {
            question: {
              include: {
                options: true,
              },
            },
          },
        },
      },
    });

    if (!testAttempt) {
      return NextResponse.json({ message: "Test attempt not found" }, { status: 404 });
    }

    // Check if the user owns this attempt
    if (testAttempt.userId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    // Transform the data for the frontend
    const questions = testAttempt.answers.map(answer => {
      const correctOption = answer.question.options.find(opt => opt.isCorrect);
      return {
        id: answer.question.id,
        question: answer.question.question,
        selectedOption: answer.selectedOption,
        correctOption: correctOption?.id || null,
        isCorrect: answer.isCorrect,
        marksObtained: answer.marksObtained,
        totalMarks: answer.question.marks,
        explanation: answer.question.explanation,
        options: answer.question.options.map(opt => ({
          id: opt.id,
          text: opt.text,
          isCorrect: opt.isCorrect,
        })),
      };
    });

    const result = {
      id: testAttempt.id,
      testPaper: {
        title: testAttempt.testPaper.title,
        subject: {
          name: testAttempt.testPaper.subject.name,
          exam: {
            name: testAttempt.testPaper.subject.exam.name,
            category: testAttempt.testPaper.subject.exam.category,
          },
        },
      },
      totalMarks: testAttempt.totalMarks,
      obtainedMarks: testAttempt.obtainedMarks,
      percentage: testAttempt.percentage,
      rank: testAttempt.rank,
      timeSpent: testAttempt.timeSpent || 0,
      submittedAt: testAttempt.submittedAt?.toISOString() || testAttempt.startedAt.toISOString(),
      questions,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching result:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
