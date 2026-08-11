import * as XLSX from 'xlsx';
import { AuditLog } from '../types/user';

export function exportAuditLogsToExcel(logs: AuditLog[], filenamePrefix = 'login-audit-log') {
  const data = logs.map(log => ({
    'شناسه log': log.id,
    'نام کاربری': log.username,
    'نام کاربر': log.displayName,
    'رویداد': log.event === 'login' ? 'ورود (Login)' : 'خروج (Logout)',
    'تاریخ شمسی': log.jalaliDate,
    'زمان': log.jalaliTime,
    'زمان میلادی (ISO)': log.timestamp
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'ورود و خروج کاربران');

  const fileName = `${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}
