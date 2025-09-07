import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user's test attempts
    const testAttempts = await prisma.testAttempt.findMany({
      where: {
        userId,
        isCompleted: true,
      },
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
      },
      orderBy: {
        submittedAt: "desc",
      },
    });

    // Calculate stats
    const totalTests = testAttempts.length;
    const averageScore = totalTests > 0 
      ? Math.round(testAttempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / totalTests)
      : 0;
    const bestScore = totalTests > 0 
      ? Math.max(...testAttempts.map(attempt => attempt.percentage))
      : 0;
    const totalTimeSpent = totalTests > 0
      ? Math.round(testAttempts.reduce((sum, attempt) => sum + (attempt.timeSpent || 0), 0) / 60)
      : 0;

    // Calculate accuracy
    const allAnswers = await prisma.answer.findMany({
      where: {
        testAttempt: {
          userId,
          isCompleted: true,
        },
      },
    });
    const accuracy = allAnswers.length > 0
      ? Math.round((allAnswers.filter(answer => answer.isCorrect).length / allAnswers.length) * 100)
      : 0;

    // Recent tests (last 5)
    const recentTests = testAttempts.slice(0, 5).map(attempt => ({
      id: attempt.id,
      title: attempt.testPaper.title,
      score: attempt.obtainedMarks,
      percentage: attempt.percentage,
      completedAt: attempt.submittedAt?.toISOString() || attempt.startedAt.toISOString(),
    }));

    // Subject-wise stats
    const subjectStats = new Map();
    testAttempts.forEach(attempt => {
      const subject = attempt.testPaper.subject.name;
      if (!subjectStats.has(subject)) {
        subjectStats.set(subject, {
          subject,
          tests: 0,
          totalScore: 0,
          correctAnswers: 0,
          totalAnswers: 0,
        });
      }
      const stats = subjectStats.get(subject);
      stats.tests += 1;
      stats.totalScore += attempt.percentage;
    });

    // Get accuracy for each subject
    for (const [subject, stats] of subjectStats) {
      const subjectAnswers = await prisma.answer.findMany({
        where: {
          testAttempt: {
            userId,
            isCompleted: true,
            testPaper: {
              subject: {
                name: subject,
              },
            },
          },
        },
      });
      
      stats.correctAnswers = subjectAnswers.filter(answer => answer.isCorrect).length;
      stats.totalAnswers = subjectAnswers.length;
      stats.averageScore = Math.round(stats.totalScore / stats.tests);
      stats.accuracy = stats.totalAnswers > 0 
        ? Math.round((stats.correctAnswers / stats.totalAnswers) * 100)
        : 0;
    }

    const subjectWiseStats = Array.from(subjectStats.values()).map(stats => ({
      subject: stats.subject,
      tests: stats.tests,
      averageScore: stats.averageScore,
      accuracy: stats.accuracy,
    }));

    return NextResponse.json({
      totalTests,
      averageScore,
      bestScore,
      totalTimeSpent,
      accuracy,
      recentTests,
      subjectWiseStats,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
