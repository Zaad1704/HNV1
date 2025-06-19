import User, { IUser } from '../models/User';
import bcrypt from 'bcryptjs'; // CORRECTED IMPORT

/**
 * Creates a new user in the database with a hashed password.
 * @param userData - The user data, including a plain text password.
 * @returns The newly created user document.
 */
export const createUserService = async (userData: Partial<IUser>): Promise<IUser> => {
    if (!userData.password) {
        throw new Error('Password is required to create a user.');
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const user = new User({
        ...userData,
        password: hashedPassword,
    });

    await user.save();
    return user;
};

/**
 * Finds a user by their email address.
 * @param email - The email of the user to find.
 * @returns The user document or null if not found.
 */
export const findUserByEmail = async (email: string): Promise<IUser | null> => {
    return User.findOne({ email });
};
