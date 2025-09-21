import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ testPaperId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { testPaperId } = await params;

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
        subject: {
          include: {
            exam: true,
          },
        },
      },
    });

    if (!testPaper) {
      return NextResponse.json({ message: "Test paper not found" }, { status: 404 });
    }

    if (!testPaper.isActive) {
      return NextResponse.json({ message: "Test paper is not active" }, { status: 400 });
    }

    // Check if user is enrolled in the exam
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: session.user.id,
        examId: testPaper.subject.examId,
      },
    });

    if (!enrollment) {
      return NextResponse.json({ message: "Not enrolled in this exam" }, { status: 403 });
    }

    return NextResponse.json(testPaper);
  } catch (error) {
    console.error("Error fetching test paper:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
