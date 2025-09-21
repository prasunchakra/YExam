import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { quizId } = await params;

    // Check if the quiz belongs to the user
    const quiz = await prisma.customQuiz.findFirst({
      where: {
        id: quizId,
        userId: session.user.id,
      },
    });

    if (!quiz) {
      return NextResponse.json({ message: "Quiz not found" }, { status: 404 });
    }

    // Delete the quiz
    await prisma.customQuiz.delete({
      where: { id: quizId },
    });

    return NextResponse.json({ message: "Quiz deleted successfully" });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
