import 'dotenv/config';
import { connectDB } from './config/db.js';
import { AdminUser } from './models/AdminUser.js';
import { User } from './models/User.js';
import { MedicalRecord } from './models/MedicalRecord.js';
import { OCRJob } from './models/OCRJob.js';
import { Provider } from './models/Provider.js';
import { Communication } from './models/Communication.js';
import { SupportTicket } from './models/SupportTicket.js';
import { SubscriptionTransaction } from './models/SubscriptionTransaction.js';
import { AuditLog } from './models/AuditLog.js';

async function seed() {
  await connectDB();

  // 1. Seed Super Admin (only role required in v1)
  const existingAdmin = await AdminUser.findOne({ email: 'admin@medivault.in' });
  if (!existingAdmin) {
    const passwordHash = await AdminUser.hashPassword('Admin@123');
    await AdminUser.create({
      name: 'Vikram Sharma',
      email: 'admin@medivault.in',
      passwordHash,
      role: 'SUPER_ADMIN',
      isActive: true,
    });
    console.log('Seeded Super Admin: admin@medivault.in / Admin@123');
  }

  // 2. Seed Users & Family Circle
  if ((await User.countDocuments()) === 0) {
    const vikram = await User.create({
      userCode: 'USR-9021',
      name: 'Vikram Sharma',
      email: 'vikram.sharma@example.com',
      phone: '+91 98765 43210',
      initials: 'VS',
      plan: 'family_premium',
      storageUsedMb: 1228,
      storageQuotaMb: 51200,
      status: 'active',
      familyMembers: [
        { memberId: 'vikram', name: 'Vikram Sharma', relation: 'Self', age: 40, bloodGroup: 'B+', initials: 'VS', color: 'mint', recordCount: 24 },
        { memberId: 'pooja', name: 'Pooja Sharma', relation: 'Wife', age: 37, bloodGroup: 'O+', initials: 'PS', color: 'peach', recordCount: 16 },
        { memberId: 'aarav', name: 'Aarav Sharma', relation: 'Son', age: 8, bloodGroup: 'B+', initials: 'AS', color: 'blue', recordCount: 8 },
        { memberId: 'deepak', name: 'Deepak Sharma', relation: 'Father', age: 68, bloodGroup: 'B+', initials: 'DS', color: 'lilac', recordCount: 12 },
      ],
      sessions: [
        { sessionId: 'SES-101', device: 'iPhone 15 Pro (MediVault iOS)', location: 'New Delhi', lastActive: 'Just now', isCurrent: true },
        { sessionId: 'SES-102', device: 'Chrome Browser (Windows 11)', location: 'Delhi-NCR', lastActive: '2 hours ago', isCurrent: false },
      ],
    });

    // 3. Seed Medical Records
    await MedicalRecord.insertMany([
      { recordCode: 'REC-1001', title: 'General physician prescription', category: 'Prescriptions', userId: vikram._id, memberName: 'Vikram Sharma', memberRelation: 'Self', provider: 'Dr. Ananya Roy', recordDate: '2026-11-02', fileType: 'PDF', uploadSource: 'camera' },
      { recordCode: 'REC-1002', title: 'Complete blood count', category: 'Lab reports', userId: vikram._id, memberName: 'Vikram Sharma', memberRelation: 'Self', provider: 'City Diagnostics', recordDate: '2026-10-28', fileType: 'PDF', uploadSource: 'pdf_upload' },
      { recordCode: 'REC-1003', title: 'Dental consultation notes', category: 'Dental', userId: vikram._id, memberName: 'Pooja Sharma', memberRelation: 'Wife', provider: 'Dr. Meera Shah', recordDate: '2026-10-25', fileType: 'PDF', uploadSource: 'pdf_upload' },
      { recordCode: 'REC-1004', title: 'Influenza vaccination record', category: 'Vaccinations', userId: vikram._id, memberName: 'Aarav Sharma', memberRelation: 'Son', provider: 'Family Health Clinic', recordDate: '2026-10-20', fileType: 'PDF', uploadSource: 'camera' },
      { recordCode: 'REC-1005', title: 'Knee X-ray report', category: 'Radiology & imaging', userId: vikram._id, memberName: 'Deepak Sharma', memberRelation: 'Father', provider: 'City Imaging Centre', recordDate: '2026-10-18', fileType: 'PDF', uploadSource: 'pdf_upload' },
      { recordCode: 'REC-1006', title: 'Annual health checkup', category: 'Lab reports', userId: vikram._id, memberName: 'Pooja Sharma', memberRelation: 'Wife', provider: 'City Diagnostics', recordDate: '2026-10-15', fileType: 'PDF', uploadSource: 'pdf_upload' },
    ]);
  }

  // 4. Seed OCR Jobs
  if ((await OCRJob.countDocuments()) === 0) {
    await OCRJob.insertMany([
      { jobCode: 'OCR-8821', userName: 'Vikram Sharma', fileName: 'Prescription_Nov2.pdf', detectedCategory: 'Prescriptions', confidence: 99.2, stage: 'Completed', durationSec: 1.4 },
      { jobCode: 'OCR-8822', userName: 'Vikram Sharma', fileName: 'Protected_Report.pdf', detectedCategory: 'Unknown', confidence: 0, stage: 'Password Locked', durationSec: 0.2, errorReason: 'PDF requires user password' },
      { jobCode: 'OCR-8823', userName: 'Pooja Sharma', fileName: 'Dental_Consult.jpg', detectedCategory: 'Dental', confidence: 96.8, stage: 'Extracting Lines', durationSec: 0.9 },
    ]);
  }

  // 5. Seed Providers
  if ((await Provider.countDocuments()) === 0) {
    await Provider.insertMany([
      { name: 'City Diagnostics', category: 'Diagnostic Centre', address: 'Ring Road, South Ext, New Delhi', phone: '+91 11 4567 8900', hours: 'Open 7 AM - 9 PM', verified: true },
      { name: 'Family Health Clinic', category: 'General Clinic', address: 'Dr. Ananya Roy (Internal Medicine)', phone: '+91 11 2345 6789', hours: 'Open 9 AM - 7 PM', verified: true },
      { name: 'Dr. Meera Shah Dental Studio', category: 'Dental Clinic', address: 'Defence Colony, New Delhi', phone: '+91 11 8765 4321', hours: 'By Appointment', verified: true },
      { name: 'Apex Super Specialty Hospital', category: '24/7 Emergency', address: 'Trauma Center & ICU Facilities', phone: '+91 11 1022 3344', hours: '24 Hours Open', verified: true },
      { name: 'Apollo Pharmacy (Saket Branch)', category: 'Pharmacy', address: 'Saket, New Delhi', phone: '011-2299', hours: '24 Hours Open', verified: false, reportedUpdate: { hasReport: true, message: 'User reported changed contact number.', suggestedPhone: '011-8844' } },
    ]);
  }

  // 6. Seed Communications (Advisories vs Offers)
  if ((await Communication.countDocuments()) === 0) {
    await Communication.insertMany([
      { type: 'advisory', title: 'Seasonal Influenza Advisory 2026', body: 'Annual influenza vaccination is recommended for children and seniors ahead of the winter season.', audience: 'All Family Profiles', expiresAt: '2026-12-31', status: 'Published' },
      { type: 'advisory', title: 'Dengue Prevention Notice', body: 'Increased cases detected in Delhi-NCR. Check your home for stagnant water and ensure timely hydration.', audience: 'Northern Region', expiresAt: '2026-12-15', status: 'Published' },
      { type: 'offer', title: '20% Off Comprehensive Health Checkup', body: 'Exclusive discount on Complete Blood Count + Lipid Profile package for MediVault members.', partnerName: 'City Diagnostics', promoCode: 'MEDIVAULT20', redemptions: 328, expiresAt: '2026-12-31', status: 'Published' },
      { type: 'offer', title: 'Free Dental Scaling Consultation', body: 'Complimentary dental checkup and routine cleaning session for all primary account holders.', partnerName: 'Dr. Meera Shah', promoCode: 'DENTOCARE', redemptions: 142, expiresAt: '2026-12-31', status: 'Published' },
    ]);
  }

  // 7. Seed Support Tickets
  if ((await SupportTicket.countDocuments()) === 0) {
    await SupportTicket.insertMany([
      { caseCode: 'DEMO-001', customerName: 'Vikram Sharma', subject: 'Document upload help', description: 'User would like assistance unlocking a password-protected PDF.', category: 'Upload Issue', priority: 'Medium', status: 'Open' },
      { caseCode: 'DEMO-002', customerName: 'Deepak Sharma', subject: 'Emergency card QR not scanning in dark mode', description: 'Reported low contrast when viewing QR card from older smartphone.', category: 'App Bug', priority: 'High', status: 'In Progress' },
    ]);
  }

  // 8. Seed Subscription Transactions
  if ((await SubscriptionTransaction.countDocuments()) === 0) {
    await SubscriptionTransaction.create({
      transactionId: 'TXN_982319_RZP',
      customerName: 'Vikram Sharma',
      amountInr: 1996,
      memberCount: 4,
      plan: 'Family Care Premium',
      status: 'Success',
      dateLabel: '24 Nov 2026',
    });
  }

  // 9. Seed Initial Audit Log
  if ((await AuditLog.countDocuments()) === 0) {
    await AuditLog.create({
      operator: 'admin@medivault.in (Super Admin)',
      role: 'SUPER_ADMIN',
      action: 'SYSTEM_SEED_COMPLETED',
      targetEntity: 'medivault_admin',
      ipAddress: '127.0.0.1',
      result: 'AUTHORIZED',
    });
  }

  console.log('Seed completed successfully.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
