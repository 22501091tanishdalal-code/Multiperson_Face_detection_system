// src/attendanceStore.ts

export type AttendanceRecord = {
  id: string;
  rollNo: string;
  name: string;
  course: string;
  date: string;   // e.g. 2025-11-19
  day: string;    // e.g. Wednesday
  time: string;   // e.g. 09:30 AM
  status: "Present" | "Absent";
};

const STORAGE_KEY = "attendanceRecords";

// saare records load karne ke liye
export function loadRecords(): AttendanceRecord[] {
  if (typeof localStorage === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as AttendanceRecord[];
  } catch (error: unknown) {
    return [];
  }
}

// naya record add karne ke liye
export function addRecord(
  partial: Omit<AttendanceRecord, "id">
): AttendanceRecord {
  const records = loadRecords();
  const newRecord: AttendanceRecord = {
    id: String(Date.now()),
    ...partial,
  };
  const updated = [newRecord, ...records];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newRecord;
}
