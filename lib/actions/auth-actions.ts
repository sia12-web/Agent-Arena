"use server";

import * as bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { checkRateLimit, createRateLimitError, RATE_LIMITS } from "@/lib/rate-limiter";

export async function registerUser(data: RegisterInput) {
  // Rate limit check (use email as identifier since user doesn't exist yet)
  const rateLimit = await checkRateLimit(
    `register:${data.email}`,
    RATE_LIMITS.login.limit,
    RATE_LIMITS.login.window
  );

  if (!rateLimit.allowed) {
    return createRateLimitError(rateLimit.retryAt!);
  }

  const validatedFields = registerSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: "Invalid input", fields: validatedFields.error.flatten() };
  }

  const { email, password } = validatedFields.data;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "Email already registered" };
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });

  return { success: true, userId: user.id };
}
