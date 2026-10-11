import React from 'react';
import { CalendarTheme } from '../types/calendar';
import { Calendar } from 'lucide-react';

interface CalendarFooterProps {
  events: Array<{ dayNum: number; title: string; isHoliday: boolean; type: string }>;
  theme: CalendarTheme;
}

export const CalendarFooter: React.FC<CalendarFooterProps> = ({
  events,
  theme
}) => {
  const isDark = theme === 'dark';

  return (
    <div
      className={`w-full border-t-2 border-stone-900 p-4 sm:p-5 select-none transition-colors ${
        isDark ? 'bg-[#181818] text-stone-200' : 'bg-white text-stone-800'
      }`}
    >
      <div className="space-y-3 text-xs sm:text-sm">
        {/* Header Bagian Keterangan */}
        <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-red-600" />
            <h4 className="font-extrabold uppercase tracking-wider text-xs sm:text-sm text-stone-900 dark:text-stone-100">
              Hari Libur & Peringatan Bulan Ini
            </h4>
          </div>
          <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">
            {events.length} Peristiwa Tercatat
          </span>
        </div>

        {/* Daftar Hari Libur & Peringatan dalam 2 Kolom Rapi */}
        {events.length === 0 ? (
          <div className="p-3 bg-stone-50 dark:bg-stone-900/50 rounded-lg text-stone-500 text-xs italic text-center">
            Tidak ada hari libur nasional atau peringatan resmi khusus pada bulan ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 max-h-[220px] overflow-y-auto pr-1">
            {events.map((ev, i) => (
              <div
                key={`${ev.dayNum}-${ev.title}-${i}`}
                className="flex items-start gap-2.5 py-1 px-1.5 rounded hover:bg-stone-100 dark:hover:bg-stone-800/60 transition-colors"
              >
                <span
                  className={`font-black min-w-[55px] sm:min-w-[65px] shrink-0 ${
                    ev.isHoliday
                      ? isDark ? 'text-red-400 font-extrabold' : 'text-[#d32f2f]'
                      : isDark ? 'text-amber-400' : 'text-stone-700'
                  }`}
                >
                  Tgl {ev.dayNum} :
                </span>
                <div className="flex-1 leading-snug">
                  <span
                    className={`font-semibold ${
                      ev.isHoliday
                        ? isDark ? 'text-red-300 font-bold' : 'text-stone-950 font-bold'
                        : 'text-stone-800 dark:text-stone-200'
                    }`}
                  >
                    {ev.title}
                  </span>
                  {ev.isHoliday && (
                    <span className="ml-1.5 inline-block text-[9px] uppercase font-black px-1.5 py-0.2 rounded bg-red-600 text-white">
                      Libur Nasional
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Catatan Pasaran Jawa di Dasar Footer */}
        <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
          <span>✦ Panca Wara (Pasaran Jawa): Legi, Pahing, Pon, Wage, Kliwon</span>
          <span className="font-semibold text-stone-700 dark:text-stone-300">Kalender Nusantara 1582 - 9999</span>
        </div>
      </div>
    </div>
  );
};
