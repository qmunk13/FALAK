/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  CalendarTheme, 
  CalendarFilters, 
  DayData, 
  GoogleCalendarEvent,
  PersonalNote,
  CalendarKop,
  AdminEvent,
  AuthSession,
  AdminMenuKey,
  CityLocation
} from './types/calendar';
import { 
  getHijriDate, 
  getJawaDate, 
  getPasaran, 
  getNeptuInfo, 
  checkAyyamulBidh, 
  checkHaramPuasa, 
  checkSeninKamis, 
  getEventsForDate,
  BULAN_HIJRIYAH,
  BULAN_JAWA,
  NAMA_BULAN
} from './utils/calendarMath';
import { CITIES_INDONESIA } from './utils/prayerTimes';
import { playBedugRhythm } from './utils/bedugAudio';

// Components
import { PublicPortal } from './components/PublicPortal';
import { LoginModal } from './components/LoginModal';
import { AdminNavbar } from './components/AdminNavbar';
import { AdminSidebar } from './components/AdminSidebar';
import { SulamNayyiroinView, SulamSubTab } from './components/SulamNayyiroinView';
import { RisalahUlaView } from './components/RisalahUlaView';
import { RisalahTsaniyahView } from './components/RisalahTsaniyahView';
import { RisalahTsalitsahView } from './components/RisalahTsalitsahView';
import { AstronomicalCoordinatesView } from './components/AstronomicalCoordinatesView';
import { QiblaHisabView } from './components/QiblaHisabView';
import { ImsakiyahTableView } from './components/ImsakiyahTableView';
import { PrayerScheduleView } from './components/PrayerScheduleView';
import { PersonalNotesView } from './components/PersonalNotesView';
import { DownloadsView } from './components/DownloadsView';
import { PrintExportView } from './components/PrintExportView';

// Interactive Wall Calendar Components
import { CalendarHeader } from './components/CalendarHeader';
import { DaysGrid } from './components/DaysGrid';
import { CalendarFooter } from './components/CalendarFooter';
import { PrayerTimesSection } from './components/PrayerTimesSection';
import { CalendarExportSection } from './components/CalendarExportSection';
import { CustomKopHeader } from './components/CustomKopHeader';
import { DayDetailModal } from './components/DayDetailModal';
import { 
  Palette, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Sparkles,
  Printer,
  Calendar as CalendarIcon,
  FileSpreadsheet,
  Globe,
  Compass,
  Clock,
  BookOpen
} from 'lucide-react';

export default function App() {
  const today = useMemo(() => new Date(), []);
  const calendarContainerRef = useRef<HTMLDivElement | null>(null);

  // AUTH STATE: Stored in localStorage
  const [authSession, setAuthSession] = useState<AuthSession | null>(() => {
    try {
      const saved = localStorage.getItem('yayasan_auth_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // MODE: 'public' or 'admin'
  const [currentMode, setCurrentMode] = useState<'public' | 'admin'>(() => {
    try {
      const saved = localStorage.getItem('yayasan_auth_session');
      return saved ? 'admin' : 'public';
    } catch {
      return 'public';
    }
  });

  // Login Modal State
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // Active Admin Menu - Default ke Koordinat Astronomis (karena kalender sudah dipindah ke portal publik)
  const [activeAdminMenu, setActiveAdminMenu] = useState<AdminMenuKey>('koordinat_astronomi');

  // Sidebar Layout State
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Calendar State
  const [month, setMonth] = useState<number>(today.getMonth() + 1);
  const [year, setYear] = useState<number>(today.getFullYear());
  const [theme, setTheme] = useState<CalendarTheme>('classic');
  const [hijriAdjustment, setHijriAdjustment] = useState<number>(0);

  const [filters, setFilters] = useState<CalendarFilters>({
    showAyyamulBidh: true,
    showSeninKamis: true,
    showHolidays: true,
    showGoogleEvents: true
  });

  // Kop Kalender Kustom Yayasan
  const [calendarKop, setCalendarKop] = useState<CalendarKop>(() => {
    try {
      const saved = localStorage.getItem('kalender_kop_config');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      enabled: true,
      title: 'YAYASAN RUANG BELAJAR',
      subtitle: 'Menebar Cahaya Pendidikan, Kebajikan & Menjaga Warisan Nusantara',
      contactInfo: 'yayasanruangbelajar1@gmail.com • 085 645 274 534',
      tagline: 'Kalender Interaktif Nusantara • Edisi Kalender Dinding & Falakiyah'
    };
  });

  const handleUpdateKop = (newKop: CalendarKop) => {
    setCalendarKop(newKop);
    try {
      localStorage.setItem('kalender_kop_config', JSON.stringify(newKop));
    } catch {}
  };

  // Agenda Yayasan (Admin Events)
  const [adminEvents, setAdminEvents] = useState<AdminEvent[]>(() => {
    try {
      const saved = localStorage.getItem('kalender_admin_events');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'ev-1',
        title: 'Kajian Rutin Falak Kitab Sullamun Nayyirain',
        dateStr: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-15`,
        category: 'pengajian',
        description: 'Pembahasan Hisab Awal Bulan Qamariyah & Rukyatul Hilal Syaikh Manshur Betawi',
        createdAt: Date.now()
      },
      {
        id: 'ev-2',
        title: 'Santunan Yatim & Bakti Sosial Yayasan',
        dateStr: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-20`,
        category: 'bakti_sosial',
        description: 'Pemberian santunan dan paket perlengkapan sekolah santri',
        createdAt: Date.now()
      }
    ];
  });

  // Catatan Pribadi State
  const [personalNotes, setPersonalNotes] = useState<PersonalNote[]>(() => {
    try {
      const saved = localStorage.getItem('kalender_personal_notes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('kalender_personal_notes', JSON.stringify(personalNotes));
    } catch (e) {
      console.error('Failed to save personal notes', e);
    }
  }, [personalNotes]);

  // Selected Day for Detail Modal
  const [selectedDayForDetail, setSelectedDayForDetail] = useState<DayData | null>(null);

  // Toast / notification banner
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  // Auth Handlers
  const handleSuccessLogin = (session: AuthSession) => {
    setAuthSession(session);
    try {
      localStorage.setItem('yayasan_auth_session', JSON.stringify(session));
    } catch {}
    setCurrentMode('admin');
    setActiveAdminMenu('koordinat_astronomi');
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
  };

  const handleLogout = () => {
    setAuthSession(null);
    try {
      localStorage.removeItem('yayasan_auth_session');
    } catch {}
    setCurrentMode('public');
    showToast('Telah keluar dari Portal Admin.');
  };

  // Personal Notes Handlers
  const handleAddPersonalNote = (dateStr: string, title: string) => {
    const newNote: PersonalNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      dateStr,
      title,
      isDone: false,
      createdAt: Date.now()
    };
    setPersonalNotes(prev => [newNote, ...prev]);
    showToast('Catatan pribadi berhasil ditambahkan!');

    if (selectedDayForDetail) {
      setSelectedDayForDetail(prev => prev ? {
        ...prev,
        personalNotes: [newNote, ...prev.personalNotes]
      } : null);
    }
  };

  const handleTogglePersonalNote = (id: string) => {
    setPersonalNotes(prev => prev.map(n => n.id === id ? { ...n, isDone: !n.isDone } : n));
    if (selectedDayForDetail) {
      setSelectedDayForDetail(prev => prev ? {
        ...prev,
        personalNotes: prev.personalNotes.map(n => n.id === id ? { ...n, isDone: !n.isDone } : n)
      } : null);
    }
  };

  const handleDeletePersonalNote = (id: string) => {
    setPersonalNotes(prev => prev.filter(n => n.id !== id));
    showToast('Catatan dihapus.');
    if (selectedDayForDetail) {
      setSelectedDayForDetail(prev => prev ? {
        ...prev,
        personalNotes: prev.personalNotes.filter(n => n.id !== id)
      } : null);
    }
  };

  const handleImportBackup = (backup: any) => {
    if (backup.kop) handleUpdateKop(backup.kop);
    if (Array.isArray(backup.personalNotes)) setPersonalNotes(backup.personalNotes);
    if (Array.isArray(backup.adminEvents)) {
      setAdminEvents(backup.adminEvents);
      try {
        localStorage.setItem('kalender_admin_events', JSON.stringify(backup.adminEvents));
      } catch {}
    }
  };

  // Calendar Navigation
  const handlePrevMonth = () => {
    if (month === 1) {
      if (year > 1582) {
        setMonth(12);
        setYear(year - 1);
      }
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      if (year < 9999) {
        setMonth(1);
        setYear(year + 1);
      }
    } else {
      setMonth(month + 1);
    }
  };

  const handleSetToday = () => {
    const now = new Date();
    setMonth(now.getMonth() + 1);
    setYear(now.getFullYear());
  };

  // Compute Days for Grid
  const calendarDays = useMemo(() => {
    const result: DayData[] = [];
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const firstDayIndex = firstDayOfMonth.getDay();
    const totalDays = new Date(year, month, 0).getDate();
    const prevMonthTotalDays = new Date(year, month - 1, 0).getDate();

    const makeDay = (dayNum: number, mIdx: number, y: number, isCurrent: boolean): DayData => {
      const d = new Date(y, mIdx, dayNum);
      const hijri = getHijriDate(d, hijriAdjustment);
      const jawa = getJawaDate(d, hijri);
      const pasaran = getPasaran(d);
      const neptu = getNeptuInfo(d, pasaran);
      const isAyyam = checkAyyamulBidh(hijri);
      const isHaram = checkHaramPuasa(hijri);
      const isSeninKm = checkSeninKamis(d.getDay(), isHaram);
      const holidays = getEventsForDate(d, hijri);

      const yStr = d.getFullYear();
      const mStr = String(d.getMonth() + 1).padStart(2, '0');
      const dStr = String(d.getDate()).padStart(2, '0');
      const dateIso = `${yStr}-${mStr}-${dStr}`;
      const dayNotes = personalNotes.filter(n => n.dateStr === dateIso);
      const dayAdminEvents = adminEvents.filter(a => a.dateStr === dateIso);

      const isTodayDate =
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear();

      return {
        date: d,
        dayNum,
        monthIdx: mIdx,
        year: y,
        isCurrentMonth: isCurrent,
        isToday: isTodayDate,
        dayOfWeek: d.getDay(),
        pasaran,
        hijri,
        jawa,
        neptu,
        isAyyamulBidh: isAyyam,
        isSeninKamis: isSeninKm,
        isHaramPuasa: isHaram,
        holidays,
        googleEvents: [],
        personalNotes: dayNotes,
        adminEvents: dayAdminEvents
      };
    };

    // 1. Previous month trailing days
    for (let i = firstDayIndex; i > 0; i--) {
      const dNum = prevMonthTotalDays - i + 1;
      const mIdx = month === 1 ? 11 : month - 2;
      const y = month === 1 ? year - 1 : year;
      result.push(makeDay(dNum, mIdx, y, false));
    }

    // 2. Current month active days
    for (let d = 1; d <= totalDays; d++) {
      result.push(makeDay(d, month - 1, year, true));
    }

    // 3. Next month leading days (to complete 35 or 42 cells)
    const totalRendered = result.length;
    const targetCount = totalRendered <= 35 ? 35 : 42;
    const remaining = targetCount - totalRendered;

    for (let n = 1; n <= remaining; n++) {
      const mIdx = month === 12 ? 0 : month;
      const y = month === 12 ? year + 1 : year;
      result.push(makeDay(n, mIdx, y, false));
    }

    return result;
  }, [year, month, hijriAdjustment, personalNotes, adminEvents, today]);

  // Dual Hijri & Javanese header subtitles
  const { hijriHeader, jawaHeader, monthlyEvents } = useMemo(() => {
    if (calendarDays.length === 0) {
      return { hijriHeader: '', jawaHeader: '', monthlyEvents: [] };
    }

    const currentMonthDays = calendarDays.filter(d => d.isCurrentMonth);
    if (currentMonthDays.length === 0) {
      return { hijriHeader: '', jawaHeader: '', monthlyEvents: [] };
    }

    const first = currentMonthDays[0];
    const last = currentMonthDays[currentMonthDays.length - 1];

    let hText = `${BULAN_HIJRIYAH[first.hijri.month]} ${first.hijri.year} H`;
    if (first.hijri.month !== last.hijri.month) {
      if (first.hijri.year === last.hijri.year) {
        hText = `${BULAN_HIJRIYAH[first.hijri.month]} - ${BULAN_HIJRIYAH[last.hijri.month]} ${first.hijri.year} H`;
      } else {
        hText = `${BULAN_HIJRIYAH[first.hijri.month]} ${first.hijri.year} - ${BULAN_HIJRIYAH[last.hijri.month]} ${last.hijri.year} H`;
      }
    }

    let jText = `${BULAN_JAWA[first.hijri.month]} ${first.jawa.year}`;
    if (first.hijri.month !== last.hijri.month) {
      if (first.jawa.year === last.jawa.year) {
        jText = `${BULAN_JAWA[first.hijri.month]} - ${BULAN_JAWA[last.hijri.month]} ${first.jawa.year}`;
      } else {
        jText = `${BULAN_JAWA[first.hijri.month]} ${first.jawa.year} - ${BULAN_JAWA[last.hijri.month]} ${last.jawa.year}`;
      }
    }

    const eventList: Array<{ dayNum: number; title: string; isHoliday: boolean; type: string }> = [];
    currentMonthDays.forEach(d => {
      d.holidays.forEach(h => {
        eventList.push({
          dayNum: d.dayNum,
          title: h.title,
          isHoliday: !!h.isHoliday,
          type: h.type
        });
      });
    });

    eventList.sort((a, b) => a.dayNum - b.dayNum);

    return {
      hijriHeader: hText,
      jawaHeader: jText,
      monthlyEvents: eventList
    };
  }, [calendarDays]);

  const activePrayerDate = useMemo(() => {
    if (today.getFullYear() === year && today.getMonth() + 1 === month) {
      return today;
    }
    return new Date(year, month - 1, 1);
  }, [year, month, today]);

  // 1. IF PUBLIC MODE IS ACTIVE:
  // Render Official Institutional Public Portal (NO LOGIN REQUIRED, CLEAN AND ORDERLY)
  if (currentMode === 'public') {
    return (
      <>
        {toastMessage && (
          <div
            className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl shadow-xl text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200 ${
              toastMessage.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
            }`}
          >
            <span>{toastMessage.text}</span>
          </div>
        )}

        <PublicPortal
          kop={calendarKop}
          month={month}
          year={year}
          theme={theme}
          onThemeChange={setTheme}
          filters={filters}
          onFilterChange={setFilters}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onSelectMonthYear={(m, y) => {
            setMonth(m);
            setYear(y);
          }}
          calendarDays={calendarDays}
          adminEvents={adminEvents}
          monthlyEvents={monthlyEvents}
          calendarContainerRef={calendarContainerRef}
          onSelectDay={(day) => setSelectedDayForDetail(day)}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onShowToast={showToast}
        />

        {/* Day Detail Modal untuk Portal Publik ketika tanggal diklik */}
        <DayDetailModal
          dayData={selectedDayForDetail}
          isOpen={!!selectedDayForDetail}
          onClose={() => setSelectedDayForDetail(null)}
          onOpenAddEvent={() => {}}
          onRequestDeleteEvent={() => {}}
          isAuthenticated={false}
          onSignInPrompt={() => setIsLoginModalOpen(true)}
          onAddPersonalNote={handleAddPersonalNote}
          onTogglePersonalNote={handleTogglePersonalNote}
          onDeletePersonalNote={handleDeletePersonalNote}
        />

        {/* LOGIN MODAL (MEMAKAI PASSWORD: admin dan user) */}
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onSuccessLogin={handleSuccessLogin}
          onShowToast={showToast}
        />
      </>
    );
  }

  // 2. IF ADMIN / INTERNAL MODE IS ACTIVE:
  // Show Admin Dashboard with Dedicated Sidebar (GROUP 1, GROUP 2, GROUP 3) and Top Brand YAYASAN RUANG BELAJAR
  const currentSession: AuthSession = authSession || {
    role: 'admin',
    username: 'admin',
    displayName: 'Administrator Yayasan',
    loggedAt: Date.now()
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl shadow-xl text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200 ${
            toastMessage.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
          }`}
        >
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* TOP HEADER: NAMA YAYASAN RUANG BELAJAR HARUS DIATAS */}
      <AdminNavbar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        authSession={currentSession}
        activeMenu={activeAdminMenu}
        onSwitchToPublic={() => setCurrentMode('public')}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex w-full relative">
        {/* DEDICATED ADMIN SIDEBAR (GROUP 1, GROUP 2, GROUP 3) */}
        <AdminSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          activeMenu={activeAdminMenu}
          onSelectMenu={(menuKey) => setActiveAdminMenu(menuKey)}
          authSession={currentSession}
          onLogout={handleLogout}
          onSwitchToPublic={() => setCurrentMode('public')}
          notesCount={personalNotes.filter(n => !n.isDone).length}
        />

        {/* MAIN ADMIN CONTENT AREA */}
        <main
          className={`flex-1 min-h-[calc(100vh-4rem)] p-3 sm:p-8 pb-24 lg:pb-8 transition-all duration-300 flex flex-col items-center w-full min-w-0 overflow-x-hidden ${
            isSidebarCollapsed ? 'lg:pl-24' : 'lg:pl-76'
          }`}
        >
          <div className="w-full max-w-6xl mx-auto min-w-0">
            {/* GROUP 1: UTAMA -> CATATAN PRIBADI */}
            {activeAdminMenu === 'catatan_pribadi' && (
              <PersonalNotesView
                notes={personalNotes}
                month={month}
                year={year}
                onAddNote={handleAddPersonalNote}
                onToggleNote={handleTogglePersonalNote}
                onDeleteNote={handleDeletePersonalNote}
                onShowToast={showToast}
              />
            )}

            {/* GROUP 2: ILMU FALAK & IBADAH -> KOORDINAT ASTRONOMIS & KUBAH LANGIT 3D/4D */}
            {activeAdminMenu === 'koordinat_astronomi' && (
              <AstronomicalCoordinatesView />
            )}

            {/* GROUP 2: ILMU FALAK & IBADAH -> DEDICATED RISALAH 1 (LANGSUNG KE HALAMAN ARAB TAHQIQ ASLI) */}
            {activeAdminMenu === 'risalah_1' && (
              <RisalahUlaView onShowToast={showToast} />
            )}

            {/* GROUP 2: ILMU FALAK & IBADAH -> DEDICATED RISALAH 2 */}
            {activeAdminMenu === 'risalah_2' && (
              <RisalahTsaniyahView onShowToast={showToast} />
            )}

            {/* GROUP 2: ILMU FALAK & IBADAH -> DEDICATED RISALAH 3 */}
            {activeAdminMenu === 'risalah_3' && (
              <RisalahTsalitsahView onShowToast={showToast} />
            )}

            {/* GROUP 2: ILMU FALAK & IBADAH -> KALKULATOR HISAB FALAK SULLAMUN NAYYIRAIN TERPADU */}
            {activeAdminMenu === 'kalkulator_falak' && (
              <SulamNayyiroinView
                key="kalkulator"
                initialSubTab="kalkulator"
                onShowToast={showToast}
              />
            )}

            {/* GROUP 2: ILMU FALAK & IBADAH -> TERJEMAH SULAM NAYYIROIN */}
            {activeAdminMenu === 'terjemah_sulam' && (
              <SulamNayyiroinView
                key="terjemah"
                initialSubTab="terjemah"
                onShowToast={showToast}
              />
            )}

            {/* GROUP 2: ILMU FALAK & IBADAH -> HISAB ARAH KIBLAT */}
            {activeAdminMenu === 'hisab_kiblat' && (
              <QiblaHisabView onShowToast={showToast} />
            )}

            {/* GROUP 2: ILMU FALAK & IBADAH -> TABEL IMSAKIYAH */}
            {activeAdminMenu === 'tabel_imsakiyah' && (
              <ImsakiyahTableView onShowToast={showToast} />
            )}

            {/* GROUP 3: PRODUKTIVITAS -> DOWNLOAD */}
            {activeAdminMenu === 'download' && (
              <DownloadsView
                kop={calendarKop}
                adminEvents={adminEvents}
                personalNotes={personalNotes}
                onImportBackup={handleImportBackup}
                onShowToast={showToast}
              />
            )}

            {/* GROUP 3: PRODUKTIVITAS -> CETAK & EKSPOR */}
            {activeAdminMenu === 'cetak_ekspor' && (
              <PrintExportView
                kop={calendarKop}
                month={month}
                year={year}
                theme={theme}
                onNavigateToCalendar={() => setCurrentMode('public')}
                onShowToast={showToast}
              />
            )}
          </div>
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR (KHUSUS TAMPILAN HP) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-900/95 backdrop-blur-md border-t border-stone-800 px-2 py-1.5 flex items-center justify-around text-[10px] text-stone-400 print:hidden shadow-2xl safe-area-pb">
        <button
          onClick={() => setActiveAdminMenu('koordinat_astronomi')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all cursor-pointer ${
            activeAdminMenu === 'koordinat_astronomi' ? 'text-cyan-400 font-bold' : 'hover:text-stone-200'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Astronomi</span>
        </button>
        <button
          onClick={() => setActiveAdminMenu('catatan_pribadi')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all cursor-pointer ${
            activeAdminMenu === 'catatan_pribadi' ? 'text-yellow-400 font-bold' : 'hover:text-stone-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Catatan</span>
        </button>
        <button
          onClick={() => setActiveAdminMenu('risalah_1')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all cursor-pointer ${
            activeAdminMenu === 'risalah_1' ? 'text-emerald-400 font-bold' : 'hover:text-stone-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span className="font-arabic">الرسالة ١</span>
        </button>
        <button
          onClick={() => setActiveAdminMenu('kalkulator_falak')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all cursor-pointer ${
            activeAdminMenu === 'kalkulator_falak' ? 'text-amber-400 font-bold' : 'hover:text-stone-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Kalkulator</span>
        </button>
        <button
          onClick={() => setActiveAdminMenu('hisab_kiblat')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all cursor-pointer ${
            activeAdminMenu === 'hisab_kiblat' ? 'text-emerald-400 font-bold' : 'hover:text-stone-200'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Kiblat</span>
        </button>
      </nav>

      {/* MODAL: Day Detail Modal (Ketika Tanggal Kalender Diklik) */}
      <DayDetailModal
        dayData={selectedDayForDetail}
        isOpen={!!selectedDayForDetail}
        onClose={() => setSelectedDayForDetail(null)}
        onOpenAddEvent={() => {}}
        onRequestDeleteEvent={() => {}}
        isAuthenticated={false}
        onSignInPrompt={() => {}}
        onAddPersonalNote={handleAddPersonalNote}
        onTogglePersonalNote={handleTogglePersonalNote}
        onDeletePersonalNote={handleDeletePersonalNote}
      />
    </div>
  );
}
