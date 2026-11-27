import mongoose from 'mongoose';

export const RECORD_CATEGORIES = [
  'Prescriptions',
  'Lab reports',
  'Specialist records',
  'Vaccinations',
  'Dental',
  'Radiology & imaging',
  'Consultation notes',
  'Discharge summaries',
  'Bills & payments',
  'Surgery & procedures',
  'Insurance documents',
  'Allergy & condition',
  'Other medical',
];

const medicalRecordSchema = new mongoose.Schema(
  {
    recordCode: { type: String, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: RECORD_CATEGORIES,
      required: true,
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    memberName: { type: String, required: true },
    memberRelation: { type: String, default: 'Self' },
    provider: { type: String, required: true },
    recordDate: { type: String, required: true },
    fileType: { type: String, enum: ['PDF', 'JPG', 'PNG'], default: 'PDF' },
    uploadSource: { type: String, enum: ['camera', 'pdf_upload', 'manual'], default: 'pdf_upload' },
    notes: { type: String, default: '' },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);
