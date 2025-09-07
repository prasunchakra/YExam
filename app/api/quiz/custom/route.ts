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

    const quizzes = await prisma.customQuiz.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(quizzes);
  } catch (error) {
    console.error("Error fetching custom quizzes:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { title, description, questionCount, duration, subjectIds, topicIds } = await request.json();

    if (!title || !subjectIds || subjectIds.length === 0) {
      return NextResponse.json(
        { message: "Title and at least one subject are required" },
        { status: 400 }
      );
    }

    const customQuiz = await prisma.customQuiz.create({
      data: {
        title,
        description: description || null,
        questionCount,
        duration,
        subjectIds,
        topicIds: topicIds || [],
        userId: session.user.id,
      },
    });

    return NextResponse.json(customQuiz, { status: 201 });
  } catch (error) {
    console.error("Error creating custom quiz:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
