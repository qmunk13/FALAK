export interface HijriDate {
  day: number;
  month: number; // 0-indexed (0: Muharram .. 11: Dzulhijjah)
  year: number;
  monthName: string;
}

export interface JawaDate {
  day: number;
  monthName: string;
  year: number;
  windu?: string;
}

export interface NeptuInfo {
  hari: string;
  pasaran: string;
  neptuHari: number;
  neptuPasaran: number;
  totalNeptu: number;
  weton: string;
}

export interface CalendarEventItem {
  id: string;
  title: string;
  description?: string;
  dateStr: string; // YYYY-MM-DD
  type: 'national_holiday' | 'observance' | 'islamic' | 'puasa' | 'google_calendar';
  isHoliday?: boolean; // Red date indicator
}

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  htmlLink?: string;
}

export interface PersonalNote {
  id: string;
  title: string;
  dateStr: string; // YYYY-MM-DD
  isDone?: boolean;
  createdAt: number;
}

export interface DayData {
  date: Date;
  dayNum: number;
  monthIdx: number;
  year: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  dayOfWeek: number; // 0 = Ahad, 1 = Senin, ..., 6 = Sabtu
  pasaran: string;
  hijri: HijriDate;
  jawa: JawaDate;
  neptu: NeptuInfo;
  isAyyamulBidh: boolean;
  isSeninKamis: boolean;
  isHaramPuasa: boolean;
  holidays: CalendarEventItem[];
  googleEvents: GoogleCalendarEvent[];
  personalNotes: PersonalNote[];
  adminEvents?: AdminEvent[];
}

export type CalendarTheme = 'classic' | 'dark' | 'print' | 'batik' | 'islamic' | 'minimal' | 'keraton';

export interface CalendarFilters {
  showAyyamulBidh: boolean;
  showSeninKamis: boolean;
  showHolidays: boolean;
  showGoogleEvents: boolean;
}

export interface PrayerTimes {
  imsak: string;
  subuh: string;
  terbit: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
}

export interface CityLocation {
  id: string;
  name: string;
  province: string;
  lat: number;
  lng: number;
  timezone: number; // 7 (WIB), 8 (WITA), 9 (WIT)
}

// Kustom Kop Foto / Logo Kalender
export interface CalendarKop {
  enabled: boolean;
  title: string; // e.g. Yayasan Ruang Belajar / Keluarga Besar H. Sukardi
  subtitle: string; // Slogan atau ucapan
  logoUrl?: string; // Data URL or Image URL
  contactInfo?: string; // No telepon / alamat
  tagline?: string;
}

// Deteksi Long Weekend & Harpitnas
export interface LongWeekendItem {
  type: 'long_weekend' | 'harpitnas';
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  daysCount: number;
  holidayTitle: string;
  holidayDayName: string;
  recommendation: string;
  cutiDate?: string; // Tanggal rekomendasi cuti
}

// Admin Announcements / Agenda Yayasan
export interface AdminEvent {
  id: string;
  title: string;
  dateStr: string; // YYYY-MM-DD
  description?: string;
  category: 'kegiatan' | 'pengumuman' | 'bakti_sosial' | 'pengajian';
  createdAt: number;
}

// Internal Auth Session (Admin & User)
export type UserRole = 'admin' | 'user';

export interface AuthSession {
  role: UserRole;
  username: string;
  displayName: string;
  loggedAt: number;
}

// Active Menu in Admin Dashboard (Kalender & Jadwal Sholat sudah berada di Portal Publik)
export type AdminMenuKey =
  | 'koordinat_astronomi'
  | 'catatan_pribadi'
  | 'risalah_1'
  | 'risalah_2'
  | 'risalah_3'
  | 'terjemah_sulam'
  | 'kalkulator_falak'
  | 'hisab_kiblat'
  | 'tabel_imsakiyah'
  | 'download'
  | 'cetak_ekspor';

