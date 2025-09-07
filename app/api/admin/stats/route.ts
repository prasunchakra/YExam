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

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Get all stats in parallel
    const [
      totalUsers,
      totalExams,
      totalTestPapers,
      totalQuestions,
      totalAttempts,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.exam.count(),
      prisma.testPaper.count(),
      prisma.question.count(),
      prisma.testAttempt.count(),
    ]);

    return NextResponse.json({
      totalUsers,
      totalExams,
      totalTestPapers,
      totalQuestions,
      totalAttempts,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
