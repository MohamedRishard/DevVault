import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOtp, hashOtp } from "@/lib/auth";
import { sendOtpEmail } from "@/lib/email";
import { sendOtpSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = sendOtpSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { email } = result.data;
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    // Rate limiting: max 3 requests per 10 minutes per email
    const recentRequestsCount = await prisma.otpCode.count({
      where: {
        email,
        createdAt: { gte: tenMinutesAgo },
      },
    });

    if (recentRequestsCount >= 3) {
      return NextResponse.json(
        { error: "Too many OTP requests. Please wait a few minutes before trying again." },
        { status: 429 }
      );
    }

    // Invalidate previous unused OTPs for this email
    await prisma.otpCode.deleteMany({
      where: { email },
    });

    // Generate secure 6-digit OTP and store SHA-256 hash
    const rawOtp = generateOtp();
    const codeHash = hashOtp(rawOtp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.otpCode.create({
      data: {
        email,
        codeHash,
        expiresAt,
        attempts: 0,
      },
    });

    // Send email via Resend
    const emailResult = await sendOtpEmail(email, rawOtp);
    if (!emailResult.success) {
      return NextResponse.json(
        { error: emailResult.error || "Failed to send verification email. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Verification code sent to ${email}`,
    });
  } catch (error: unknown) {
    console.error("send-otp error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
