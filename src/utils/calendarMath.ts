import { HijriDate, JawaDate, NeptuInfo, CalendarEventItem } from '../types/calendar';

export const NAMA_BULAN = [
  "JANUARI", "FEBRUARI", "MARET", "APRIL", "MEI", "JUNI",
  "JULI", "AGUSTUS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DESEMBER"
];

export const BULAN_HIJRIYAH = [
  "Muharram", "Safar", "Rabi'ul Awal", "Rabi'ul Akhir",
  "Jumadil Awal", "Jumadil Akhir", "Rajab", "Sya'ban",
  "Ramadhan", "Syawal", "Dzulqa'dah", "Dzulhijjah"
];

export const BULAN_JAWA = [
  "Suro", "Sapar", "Mulud", "Bakda Mulud",
  "Jumadilawal", "Jumadilakhir", "Rejeb", "Ruwah",
  "Pasa", "Sawal", "Sela", "Besar"
];

export const PASARAN_LIST = ["Legi", "Pahing", "Pon", "Wage", "Kliwon"];

export const WINDU_LIST = ["Adi (Kuntara)", "Kencana (Sengara)", "Maju (Sancaya)", "Kuntara (Adi)"];

export const NAMA_HARI = ["Ahad", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export const NEPTU_HARI: Record<number, number> = {
  0: 5, // Ahad
  1: 4, // Senin
  2: 3, // Selasa
  3: 7, // Rabu
  4: 8, // Kamis
  5: 6, // Jumat
  6: 9  // Sabtu
};

export const NEPTU_PASARAN: Record<string, number> = {
  "Legi": 5,
  "Pahing": 9,
  "Pon": 7,
  "Wage": 4,
  "Kliwon": 8
};

export function toArabicNumeral(n: number): string {
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return n.toString().split('').map(digit => arabicNumbers[parseInt(digit, 10)] ?? digit).join('');
}

/**
 * Calculates Hijri date based on Kuweit/Astronomical algorithm
 * Includes optional user adjustment days (-2 .. +2) for local rukyatul hilal
 */
export function getHijriDate(date: Date, adjustmentDays: number = 0): HijriDate {
  const adjustedTime = date.getTime() + (adjustmentDays * 86400000);
  const adjustedDate = new Date(adjustedTime);

  const jd = Math.floor((adjustedDate.getTime() / 86400000) + 2440587.5);
  let l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  const j = (Math.floor((10985 - l) / 5316)) * (Math.floor(50 * l / 17719)) + (Math.floor(l / 5670)) * (Math.floor(43 * l / 15238));
  l = l - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) - (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
  const month = Math.floor((24 * l) / 709);
  const day = l - Math.floor((709 * month) / 24);
  const year = Math.floor(30 * n + j - 30);

  const normalizedMonth = Math.max(0, Math.min(11, month - 1));
  return {
    day: day,
    month: normalizedMonth,
    year: year,
    monthName: BULAN_HIJRIYAH[normalizedMonth] || BULAN_HIJRIYAH[0]
  };
}

/**
 * Calculates Javanese date (Tahun Jawa Sultan Agungan)
 */
export function getJawaDate(date: Date, hijri: HijriDate): JawaDate {
  const jawaYear = hijri.year + 512;
  const monthIdx = Math.max(0, Math.min(11, hijri.month));
  const jawaMonth = BULAN_JAWA[monthIdx] || BULAN_JAWA[0];
  const winduIdx = Math.abs(jawaYear % 4);
  return {
    day: hijri.day,
    monthName: jawaMonth,
    year: jawaYear,
    windu: WINDU_LIST[winduIdx]
  };
}

/**
 * Calculates Pasaran Jawa (Panca Wara)
 * Calibrated: 1 Jan 1900 is Senin Pahing (index 1), 17 Aug 1945 is Jumat Legi (index 0)
 */
export function getPasaran(date: Date): string {
  // Use UTC to prevent daylight saving / timezone shifts
  const dUtc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const baseUtc = Date.UTC(1900, 0, 1);
  const diffDays = Math.floor((dUtc - baseUtc) / 86400000);
  // +1 offset ensures 1900-01-01 is Pahing and 1945-08-17 is Legi
  const pasaranIndex = (((diffDays + 1) % 5) + 5) % 5;
  return PASARAN_LIST[pasaranIndex];
}

/**
 * Calculates Neptu Weton and Total Neptu
 */
export function getNeptuInfo(date: Date, pasaran: string): NeptuInfo {
  const dayOfWeek = date.getDay();
  const namaHari = NAMA_HARI[dayOfWeek];
  const neptuHari = NEPTU_HARI[dayOfWeek] ?? 5;
  const neptuPasaran = NEPTU_PASARAN[pasaran] ?? 5;
  const totalNeptu = neptuHari + neptuPasaran;
  const weton = `${namaHari} ${pasaran}`;

  return {
    hari: namaHari,
    pasaran: pasaran,
    neptuHari,
    neptuPasaran,
    totalNeptu,
    weton
  };
}

/**
 * Check if the day is Puasa Ayyamul Bidh (13, 14, 15 Hijriyah)
 * Excludes 13 Dzulhijjah which is Hari Tasyrik (haram berpuasa)
 */
export function checkAyyamulBidh(hijri: HijriDate): boolean {
  if (hijri.month === 11 && hijri.day === 13) {
    return false; // 13 Dzulhijjah is Hari Tasyrik
  }
  return hijri.day === 13 || hijri.day === 14 || hijri.day === 15;
}

/**
 * Check if the day is Hari Tasyrik or Hari Raya (Haram Berpuasa)
 */
export function checkHaramPuasa(hijri: HijriDate): boolean {
  // 1 Syawal (Idul Fitri)
  if (hijri.month === 9 && hijri.day === 1) return true;
  // 10 Dzulhijjah (Idul Adha) & 11, 12, 13 Dzulhijjah (Hari Tasyrik)
  if (hijri.month === 11 && [10, 11, 12, 13].includes(hijri.day)) return true;
  return false;
}

/**
 * Check if day is Senin or Kamis for Puasa Sunnah
 */
export function checkSeninKamis(dayOfWeek: number, isHaramPuasa: boolean): boolean {
  if (isHaramPuasa) return false;
  return dayOfWeek === 1 || dayOfWeek === 4;
}

/**
 * Indonesian National Holidays and Significant Events
 */
export const EVENT_DATABASE_MASEHI: Record<number, Array<{ day: number; title: string; isHoliday: boolean }>> = {
  1: [
    { day: 1, title: "Tahun Baru Masehi", isHoliday: true },
    { day: 10, title: "Hari Gerakan Satu Juta Pohon", isHoliday: false },
    { day: 25, title: "Hari Gizi Nasional", isHoliday: false }
  ],
  2: [
    { day: 9, title: "Hari Pers Nasional", isHoliday: false },
    { day: 14, title: "Hari Kasih Sayang (Valentine)", isHoliday: false },
    { day: 21, title: "Hari Peduli Sampah Nasional", isHoliday: false }
  ],
  3: [
    { day: 8, title: "Hari Perempuan Internasional", isHoliday: false },
    { day: 9, title: "Hari Musik Nasional", isHoliday: false },
    { day: 22, title: "Hari Air Sedunia", isHoliday: false },
    { day: 30, title: "Hari Film Nasional", isHoliday: false }
  ],
  4: [
    { day: 21, title: "Hari Kartini", isHoliday: false },
    { day: 22, title: "Hari Bumi", isHoliday: false },
    { day: 28, title: "Hari Puisi Nasional", isHoliday: false }
  ],
  5: [
    { day: 1, title: "Hari Buruh Internasional (May Day)", isHoliday: true },
    { day: 2, title: "Hari Pendidikan Nasional (Hardiknas)", isHoliday: false },
    { day: 20, title: "Hari Kebangkitan Nasional (Harkitnas)", isHoliday: false }
  ],
  6: [
    { day: 1, title: "Hari Lahir Pancasila", isHoliday: true },
    { day: 5, title: "Hari Lingkungan Hidup Sedunia", isHoliday: false },
    { day: 21, title: "Hari Krida Pertanian", isHoliday: false }
  ],
  7: [
    { day: 22, title: "Hari Kejaksaan", isHoliday: false },
    { day: 23, title: "Hari Anak Nasional", isHoliday: false }
  ],
  8: [
    { day: 10, title: "Hari Veteran Nasional", isHoliday: false },
    { day: 14, title: "Hari Pramuka", isHoliday: false },
    { day: 17, title: "Hari Kemerdekaan RI (HUT RI)", isHoliday: true }
  ],
  9: [
    { day: 9, title: "Hari Olahraga Nasional (Haornas)", isHoliday: false },
    { day: 17, title: "Hari Palang Merah Indonesia (PMI)", isHoliday: false },
    { day: 24, title: "Hari Tani Nasional", isHoliday: false },
    { day: 28, title: "Hari Kereta Api", isHoliday: false }
  ],
  10: [
    { day: 1, title: "Hari Kesaktian Pancasila", isHoliday: false },
    { day: 2, title: "Hari Batik Nasional", isHoliday: false },
    { day: 5, title: "Hari Tentara Nasional Indonesia (TNI)", isHoliday: false },
    { day: 22, title: "Hari Santri Nasional", isHoliday: false },
    { day: 28, title: "Hari Sumpah Pemuda", isHoliday: false }
  ],
  11: [
    { day: 10, title: "Hari Pahlawan", isHoliday: false },
    { day: 12, title: "Hari Kesehatan Nasional / Hari Ayah", isHoliday: false },
    { day: 25, title: "Hari Guru Nasional", isHoliday: false },
    { day: 28, title: "Hari Menanam Pohon Indonesia", isHoliday: false }
  ],
  12: [
    { day: 1, title: "Hari AIDS Sedunia", isHoliday: false },
    { day: 4, title: "Hari Artileri", isHoliday: false },
    { day: 9, title: "Hari Anti Korupsi Sedunia", isHoliday: false },
    { day: 13, title: "Hari Nusantara", isHoliday: false },
    { day: 22, title: "Hari Ibu Nasional", isHoliday: false },
    { day: 25, title: "Hari Raya Natal", isHoliday: true }
  ]
};

/**
 * Islamic Dates and Holidays (Mapped by Hijri Month 0-11)
 */
export const ISLAMIC_EVENTS: Record<number, Array<{ day: number; title: string; isHoliday: boolean }>> = {
  0: [ // Muharram
    { day: 1, title: "Tahun Baru Islam (1 Muharram)", isHoliday: true },
    { day: 9, title: "Puasa Tasu'a (9 Muharram)", isHoliday: false },
    { day: 10, title: "Hari Asyura (10 Muharram)", isHoliday: false }
  ],
  2: [ // Rabiul Awal
    { day: 12, title: "Maulid Nabi Muhammad SAW", isHoliday: true }
  ],
  6: [ // Rajab
    { day: 27, title: "Isra' Mi'raj Nabi Muhammad SAW", isHoliday: true }
  ],
  7: [ // Sya'ban
    { day: 15, title: "Malam Nisfu Sya'ban", isHoliday: false }
  ],
  8: [ // Ramadhan
    { day: 1, title: "Awal Puasa Ramadhan", isHoliday: false },
    { day: 17, title: "Nuzulul Qur'an (17 Ramadhan)", isHoliday: false }
  ],
  9: [ // Syawal
    { day: 1, title: "Hari Raya Idul Fitri (1 Syawal)", isHoliday: true },
    { day: 2, title: "Hari Raya Idul Fitri (2 Syawal)", isHoliday: true }
  ],
  11: [ // Dzulhijjah
    { day: 9, title: "Hari Arafah (9 Dzulhijjah)", isHoliday: false },
    { day: 10, title: "Hari Raya Idul Adha (10 Dzulhijjah)", isHoliday: true },
    { day: 11, title: "Hari Tasyrik (11 Dzulhijjah)", isHoliday: false },
    { day: 12, title: "Hari Tasyrik (12 Dzulhijjah)", isHoliday: false },
    { day: 13, title: "Hari Tasyrik (13 Dzulhijjah)", isHoliday: false }
  ]
};

/**
 * Helper to get all events for a given calendar date
 */
export function getEventsForDate(date: Date, hijri: HijriDate): CalendarEventItem[] {
  const events: CalendarEventItem[] = [];
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();
  const dateStr = date.toISOString().split('T')[0];

  // 1. Check fixed Solar/Masehi events
  const masehiList = EVENT_DATABASE_MASEHI[month] || [];
  for (const m of masehiList) {
    if (m.day === day) {
      events.push({
        id: `masehi-${month}-${day}-${m.title}`,
        title: m.title,
        dateStr,
        type: m.isHoliday ? 'national_holiday' : 'observance',
        isHoliday: m.isHoliday
      });
    }
  }

  // 2. Check Islamic Lunar events
  const islamicList = ISLAMIC_EVENTS[hijri.month] || [];
  for (const isl of islamicList) {
    if (isl.day === hijri.day) {
      events.push({
        id: `hijri-${hijri.month}-${hijri.day}-${isl.title}`,
        title: isl.title,
        dateStr,
        type: 'islamic',
        isHoliday: isl.isHoliday
      });
    }
  }

  return events;
}
