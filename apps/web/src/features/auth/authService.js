/**
 * MapWave Authentication & ID Card Service
 * Holds user session, mock OCR recognizer for JSSATE ID Cards, and student profile data.
 */

export const SAMPLE_STUDENT_PROFILE = {
  id: 'usr_deepak_gm_0082',
  name: 'DEEPAK G M',
  srNo: '24-0082',
  usn: '1JS24IS188',
  dept: 'ISE',
  departmentFullName: 'Information Science & Engineering',
  role: 'STUDENT',
  roleLabel: 'Verified Student',
  institution: 'JSSATE BENGALURU',
  institutionFull: 'JSS Academy of Technical Education, Bengaluru',
  photo: '/images/student_photo.jpg',
  cardImage: '/images/sample_student_id.jpg',
  barcode: '1JS24IS188',
  academicBlock: 'Academic Block A',
  preferredFloor: 2,
  email: 'deepak.gm@jssateb.ac.in',
  joinedYear: 2024,
  validUntil: '2028',
  verifiedAt: new Date().toISOString(),
};

export const SAMPLE_FACULTY_PROFILE = {
  id: 'usr_faculty_ise_01',
  name: 'DR. NAGASHREE S',
  srNo: 'FAC-0142',
  usn: 'JSS-FAC-ISE-04',
  dept: 'ISE',
  departmentFullName: 'Information Science & Engineering',
  role: 'FACULTY',
  roleLabel: 'Associate Professor',
  institution: 'JSSATE BENGALURU',
  institutionFull: 'JSS Academy of Technical Education, Bengaluru',
  photo: '/images/student_photo.jpg',
  cardImage: '/images/sample_student_id.jpg',
  barcode: 'JSSFACISE04',
  academicBlock: 'Academic Block A',
  preferredFloor: 2,
  email: 'nagashree@jssateb.ac.in',
  joinedYear: 2018,
  validUntil: 'PERMANENT',
  verifiedAt: new Date().toISOString(),
};

const STORAGE_KEY = 'mapwave_authenticated_user';

export function getStoredUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn('[AuthService] Could not read stored user', err);
    return null;
  }
}

export function saveStoredUser(user) {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (err) {
    console.warn('[AuthService] Could not save user', err);
  }
}

export function clearStoredUser() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('[AuthService] Could not clear user', err);
  }
}

/**
 * Parses scanned ID card data.
 * In a production OCR pipeline, this connects to Tesseract.js or Cloud Vision API.
 * Here it simulates instantaneous neural recognition of JSSATE identity cards.
 */
export async function parseIdCardScan(imageSrc, role = 'STUDENT') {
  // Simulate optical analysis latency
  await new Promise((resolve) => setTimeout(resolve, 800));

  if (role === 'FACULTY') {
    return { ...SAMPLE_FACULTY_PROFILE, verifiedAt: new Date().toISOString() };
  }

  // Returns Deepak G M student profile matching image 3
  return { ...SAMPLE_STUDENT_PROFILE, verifiedAt: new Date().toISOString() };
}
