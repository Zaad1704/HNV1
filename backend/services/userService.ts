// services/userService.ts

import User from '../models/User'; // Assuming you need the User model here
import bcrypt from 'bcrypt';     // Assuming you'll handle password hashing here

// FIX: Define the RegisterDTO interface at the top of the file.
// This tells TypeScript what properties the 'data' object will have.
export interface RegisterDTO {
  email?: string;
  password?: string;
  name?: string;
  role?: string;
  organizationId?: string;
}

export async function registerUser(data: RegisterDTO) {
  // Example of business logic that would go inside this function
  if (!data.email || !data.password) {
    throw new Error('Email and password are required');
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);
  
  const newUser = await User.create({
    ...data,
    password: hashedPassword,
  });

  // It's good practice to not return the password hash
  const userObject = newUser.toObject();
  delete userObject.password;

  return userObject;
}
