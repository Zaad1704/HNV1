"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupService = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class BackupService {
    static async createBackup() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupName = `backup-${timestamp}`;
        try {
            const mongoUri = process.env.MONGO_URI;
            const dbName = mongoUri.split('/').pop()?.split('?')[0];
            await execAsync('mkdir -p backups');
            const command = `mongodump --uri="${mongoUri}" --out=backups/${backupName}`;
            await execAsync(command);
            console.log(`Backup created: ${backupName}`);
            return { success: true, backupName };
        }
        catch (error) {
            console.error('Backup failed:', error);
            return { success: false, error: error.message };
        }
    }
    static async scheduleBackups() {
        setInterval(async () => {
            await this.createBackup();
        }, 24 * 60 * 60 * 1000);
        console.log('Backup scheduler initialized');
    }
    static async cleanOldBackups(daysToKeep = 7) {
        try {
            const command = `find backups -type d -mtime +${daysToKeep} -exec rm -rf {} +`;
            await execAsync(command);
            console.log(`Cleaned backups older than ${daysToKeep} days`);
        }
        catch (error) {
            console.error('Cleanup failed:', error);
        }
    }
}
exports.BackupService = BackupService;
