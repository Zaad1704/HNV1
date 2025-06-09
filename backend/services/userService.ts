// backend/services/userService.ts

import User from '../models/User';
import bcrypt from 'bcrypt';

// Definition for the Register Data Transfer Object
export interface RegisterDTO {
  email?: string;
  password?: string;
  name?: string;
  role?: string;
  organizationId?: string;
}

export async function registerUser(data: RegisterDTO) {
  if (!data.email || !data.password) {
    throw new Error('Email and password are required');
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);
  
  const newUser = await User.create({
    ...data,
    password: hashedPassword,
  });

  // FIX: This is a safer way to return the user object without the password
  const { password, ...userData } = newUser.toObject();
  return userData;
}
