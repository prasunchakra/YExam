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

    const results = await prisma.testAttempt.findMany({
      where: {
        userId: session.user.id,
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

    const formattedResults = results.map(result => ({
      id: result.id,
      testPaper: {
        title: result.testPaper.title,
        subject: {
          name: result.testPaper.subject.name,
          exam: {
            name: result.testPaper.subject.exam.name,
            category: result.testPaper.subject.exam.category,
          },
        },
      },
      totalMarks: result.totalMarks,
      obtainedMarks: result.obtainedMarks,
      percentage: result.percentage,
      rank: result.rank,
      timeSpent: result.timeSpent || 0,
      submittedAt: result.submittedAt?.toISOString() || result.startedAt.toISOString(),
    }));

    return NextResponse.json(formattedResults);
  } catch (error) {
    console.error("Error fetching results:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
