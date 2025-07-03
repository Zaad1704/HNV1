import mongoose from 'mongoose';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class BackupService {
  static async createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `backup-${timestamp}`;
    
    try {
      const mongoUri = process.env.MONGO_URI!;
      const dbName = mongoUri.split('/').pop()?.split('?')[0];
      
      // Create backup directory
      await execAsync('mkdir -p backups');
      
      // Create MongoDB dump
      const command = `mongodump --uri="${mongoUri}" --out=backups/${backupName}`;
      await execAsync(command);

      return { success: true, backupName };
    } catch (error) {
      console.error('Backup failed:', error);
      return { success: false, error: error.message };
    }
  }
  
  static async scheduleBackups() {
    // Run backup every 24 hours
    setInterval(async () => {
      await this.createBackup();
    }, 24 * 60 * 60 * 1000);

  }
  
  static async cleanOldBackups(daysToKeep: number = 7) {
    try {
      const command = `find backups -type d -mtime +${daysToKeep} -exec rm -rf {} +`;
      await execAsync(command);

    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  }
}