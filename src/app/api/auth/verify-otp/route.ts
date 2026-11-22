import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashOtp, signSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { verifyOtpSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = verifyOtpSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { email, code } = result.data;

    // Find the latest active OTP code for this email
    const record = await prisma.otpCode.findFirst({
      where: {
        email,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      return NextResponse.json(
        { error: "Invalid or expired verification code. Please request a new one." },
        { status: 400 }
      );
    }

    // Enforce max 5 verification attempts
    if (record.attempts >= 5) {
      await prisma.otpCode.delete({ where: { id: record.id } });
      return NextResponse.json(
        { error: "Too many failed attempts. Please request a new verification code." },
        { status: 400 }
      );
    }

    const providedHash = hashOtp(code);
    if (providedHash !== record.codeHash) {
      await prisma.otpCode.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      });

      const remaining = 5 - (record.attempts + 1);
      return NextResponse.json(
        {
          error: `Incorrect verification code. ${remaining > 0 ? `${remaining} attempts remaining.` : "Please request a new code."}`,
        },
        { status: 400 }
      );
    }

    // Verification successful: delete all used OTP records for this email
    await prisma.otpCode.deleteMany({
      where: { email },
    });

    // Create User record if it doesn't exist yet
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email },
    });

    // Sign JWT token
    const token = await signSessionToken({
      userId: user.id,
      email: user.email,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
      },
    });

    // Set secure HttpOnly session cookie (7 days expiry)
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    console.error("verify-otp error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during verification." },
      { status: 500 }
    );
  }
}
