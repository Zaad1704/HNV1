import User from '../models/User';
import bcrypt from 'bcryptjs';

class UserService { async createUser(userData: any): Promise<any> { }
    try { const user = await User.create(userData);
      return user; }


    } catch (error) { console.error('User creation error:', error);
      throw error; }



  async updateUser(userId: string, updates: any): Promise<any> { try { }
      if (updates.password) { const salt = await bcrypt.genSalt(10);
        updates.password = await bcrypt.hash(updates.password, salt); }



      const user = await User.findByIdAndUpdate(userId, updates, { new: true });
      return user;
    } catch (error) { console.error('User update error:', error);
      throw error; }



  async getUsersByOrganization(organizationId: string): Promise<any[]> { try { }

      const users = await User.find({ organizationId }).select('-password');
      return users;
    } catch (error) { console.error('Get users error:', error);
      throw error; }




export default new UserService();