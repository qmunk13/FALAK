import React from 'react';
import { DayData, CalendarTheme, CalendarFilters } from '../types/calendar';
import { toArabicNumeral } from '../utils/calendarMath';

interface DaysGridProps {
  days: DayData[];
  theme: CalendarTheme;
  filters: CalendarFilters;
  onSelectDay: (day: DayData) => void;
}

export const DaysGrid: React.FC<DaysGridProps> = ({
  days,
  theme,
  filters,
  onSelectDay
}) => {
  const isDark = theme === 'dark';

  return (
    <div className="w-full">
      {/* Weekday Header (7 Columns) */}
      <div className="grid grid-cols-7 text-center font-black text-[10px] sm:text-sm md:text-base border-b-2 border-stone-900 select-none">
        <div className="py-1.5 sm:py-3 bg-[#e53935] text-white uppercase tracking-wider border-r border-stone-900 last:border-r-0 truncate">
          Ahad
        </div>
        <div className="py-1.5 sm:py-3 bg-[#ffb300] text-stone-950 uppercase tracking-wider border-r border-stone-900 truncate">
          Senin
        </div>
        <div className="py-1.5 sm:py-3 bg-[#ffb300] text-stone-950 uppercase tracking-wider border-r border-stone-900 truncate">
          Selasa
        </div>
        <div className="py-1.5 sm:py-3 bg-[#ffb300] text-stone-950 uppercase tracking-wider border-r border-stone-900 truncate">
          Rabu
        </div>
        <div className="py-1.5 sm:py-3 bg-[#ffb300] text-stone-950 uppercase tracking-wider border-r border-stone-900 truncate">
          Kamis
        </div>
        <div className="py-1.5 sm:py-3 bg-[#00897b] text-white uppercase tracking-wider border-r border-stone-900 truncate">
          Jumat
        </div>
        <div className="py-1.5 sm:py-3 bg-[#ffb300] text-stone-950 uppercase tracking-wider truncate">
          Sabtu
        </div>
      </div>

      {/* Days Grid */}
      <div
        className={`grid grid-cols-7 gap-[1px] ${
          isDark ? 'bg-stone-800' : 'bg-stone-300'
        }`}
      >
        {days.map((day, idx) => {
          const isAhad = day.dayOfWeek === 0;
          const isJumat = day.dayOfWeek === 5;
          const hasHoliday = day.holidays.some((h) => h.isHoliday);
          const hasObservance = day.holidays.length > 0;
          const hasGoogleEvents = day.googleEvents.length > 0;

          // Determine main text color
          let textColorClass = 'text-stone-900';
          if (!day.isCurrentMonth) {
            textColorClass = isDark ? 'text-stone-600' : 'text-stone-400';
          } else if (hasHoliday || isAhad) {
            textColorClass = isDark ? 'text-red-400' : 'text-[#d32f2f]';
          } else if (isJumat) {
            textColorClass = isDark ? 'text-purple-400' : 'text-[#8e24aa]';
          } else {
            textColorClass = isDark ? 'text-stone-100' : 'text-[#111111]';
          }

          // Background color
          let bgClass = isDark ? 'bg-[#141414]' : 'bg-white';
          if (!day.isCurrentMonth) {
            bgClass = isDark ? 'bg-[#0f0f0f]' : 'bg-[#f7f7f7]';
          } else if (day.isToday) {
            bgClass = isDark ? 'bg-amber-950/30 ring-2 ring-amber-500/80 ring-inset' : 'bg-amber-50/70 ring-2 ring-amber-500/80 ring-inset';
          }

          return (
            <div
              key={`${day.year}-${day.monthIdx}-${day.dayNum}-${idx}`}
              onClick={() => onSelectDay(day)}
              className={`group relative p-1 sm:p-2 md:p-2.5 min-h-[66px] sm:min-h-[105px] md:min-h-[125px] flex flex-col justify-between transition-all select-none cursor-pointer hover:z-10 ${bgClass} ${
                day.isCurrentMonth
                  ? isDark
                    ? 'hover:bg-stone-800/90'
                    : 'hover:bg-sky-50/60'
                  : 'opacity-70'
              }`}
            >
              {/* Top Row: Arabic Hijri Badge & Indicators */}
              <div className="flex items-start justify-between gap-0.5 sm:gap-1 w-full relative">
                {/* Today Pill or Google Event indicator */}
                <div className="flex items-center gap-1">
                  {day.isToday && (
                    <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-wider px-1 sm:px-1.5 py-0.2 rounded bg-amber-500 text-stone-950 shadow-xs">
                      Hari Ini
                    </span>
                  )}
                  {filters.showGoogleEvents && hasGoogleEvents && day.isCurrentMonth && (
                    <span
                      title={`${day.googleEvents.length} agenda Google Calendar`}
                      className="flex items-center gap-0.5 text-[8px] sm:text-[9px] font-bold px-1 py-0.2 rounded bg-blue-600 text-white shadow-xs"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      <span>{day.googleEvents.length}</span>
                    </span>
                  )}
                  {day.personalNotes && day.personalNotes.length > 0 && day.isCurrentMonth && (
                    <span
                      title={`${day.personalNotes.length} catatan pribadi & to-do`}
                      className="flex items-center gap-0.5 text-[8px] sm:text-[9px] font-bold px-1 py-0.2 rounded bg-amber-600 text-white shadow-xs"
                    >
                      <span>📝</span>
                      <span>{day.personalNotes.length}</span>
                    </span>
                  )}
                  {day.adminEvents && day.adminEvents.length > 0 && day.isCurrentMonth && (
                    <span
                      title={`${day.adminEvents.length} agenda yayasan`}
                      className="flex items-center gap-0.5 text-[8px] sm:text-[9px] font-bold px-1 py-0.2 rounded bg-emerald-600 text-white shadow-xs"
                    >
                      <span>🏛️</span>
                      <span>{day.adminEvents.length}</span>
                    </span>
                  )}
                </div>

                {/* Arabic Hijri Badge in Top Right (Angka Arab Hijriyah) */}
                {day.isCurrentMonth && (
                  <div
                    title={`Tanggal ${day.hijri.day} ${day.hijri.monthName} ${day.hijri.year} H`}
                    className="font-serif text-xs sm:text-base md:text-lg font-black bg-[#2e7d32] text-white px-1 sm:px-2 py-0.2 sm:py-0.5 rounded shadow-sm ml-auto group-hover:scale-110 transition-transform leading-none"
                    style={{ fontFamily: "'Amiri', serif" }}
                  >
                    {toArabicNumeral(day.hijri.day)}
                  </div>
                )}
              </div>

              {/* Center: Large Masehi Date */}
              <div className="my-auto py-0.5 text-center sm:text-left">
                <span
                  className={`font-black text-xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight leading-none block ${textColorClass}`}
                >
                  {day.dayNum}
                </span>
              </div>

              {/* Bottom: Tanggal Hijriyah + Pasaran Jawa (Pahing, Kliwon, Wage, Legi, Pon) */}
              <div className="mt-auto pt-0.5 sm:pt-1 border-t border-stone-200/50 dark:border-stone-800/80 w-full">
                <div
                  className={`text-[8px] sm:text-xs md:text-sm font-black leading-tight ${
                    !day.isCurrentMonth
                      ? 'text-stone-400 dark:text-stone-600'
                      : hasHoliday || isAhad
                      ? isDark ? 'text-red-400' : 'text-[#d32f2f]'
                      : isJumat
                      ? isDark ? 'text-purple-400' : 'text-[#8e24aa]'
                      : isDark ? 'text-stone-200' : 'text-stone-800'
                  }`}
                >
                  {day.isCurrentMonth ? (
                    <div className="flex flex-col sm:flex-row items-center sm:justify-between w-full text-center sm:text-left gap-0">
                      {/* Di Layar HP: tampil 2 baris (Angka Hijriyah + Nama Pasaran Utuh) */}
                      <span className="sm:inline font-bold opacity-80 sm:mr-1">
                        {day.hijri.day}
                      </span>
                      <span className="block sm:inline font-black tracking-tighter sm:tracking-normal uppercase sm:capitalize">
                        {day.pasaran}
                      </span>
                      <span className="text-[10px] sm:text-[11px] font-semibold opacity-75 hidden md:inline shrink-0 ml-auto">
                        N.{day.neptu.totalNeptu}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
