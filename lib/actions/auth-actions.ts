"use server";

import * as bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";

export async function registerUser(data: RegisterInput) {
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
