import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Sparkles, 
  Info, 
  Plus, 
  Trash2, 
  Clock, 
  MapPin, 
  ExternalLink,
  StickyNote,
  CheckCircle2,
  Circle,
  ListTodo
} from 'lucide-react';
import { DayData, GoogleCalendarEvent, PersonalNote } from '../types/calendar';
import { toArabicNumeral } from '../utils/calendarMath';

interface DayDetailModalProps {
  dayData: DayData | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenAddEvent: (date: Date) => void;
  onRequestDeleteEvent: (event: GoogleCalendarEvent) => void;
  isAuthenticated: boolean;
  onSignInPrompt: () => void;
  onAddPersonalNote: (dateStr: string, title: string) => void;
  onTogglePersonalNote: (id: string) => void;
  onDeletePersonalNote: (id: string) => void;
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({
  dayData,
  isOpen,
  onClose,
  onOpenAddEvent,
  onRequestDeleteEvent,
  isAuthenticated,
  onSignInPrompt,
  onAddPersonalNote,
  onTogglePersonalNote,
  onDeletePersonalNote
}) => {
  if (!isOpen || !dayData) return null;

  const { date, pasaran, hijri, jawa, neptu, holidays, googleEvents, personalNotes } = dayData;
  const [newNoteInput, setNewNoteInput] = useState('');

  // ISO date string: YYYY-MM-DD
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const dateIso = `${y}-${m}-${d}`;

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteInput.trim()) return;
    onAddPersonalNote(dateIso, newNoteInput.trim());
    setNewNoteInput('');
  };

  // Primbon / watak ringkas berdasarkan total neptu
  const getNeptuWatak = (total: number) => {
    switch (total) {
      case 7: return 'Pendito Kang Lelaku: Senang bepergian jauh, suka bertualang, bicaranya lugas.';
      case 8: return 'Lakuning Geni: Memiliki semangat membara, pantang menyerah, pemberani.';
      case 9: return 'Lakuning Angin: Mudah bergaul, luwes, pandai mengambil hati orang.';
      case 10: return 'Pendito Mbangun Teki: Suka menolong, gemar belajar ilmu baru, bijaksana.';
      case 11: return 'Lakuning Setan: Cerdik, ulet, memiliki ambisi kuat dan tak mudah goyah.';
      case 12: return 'Lakuning Kembang: Penyejuk suasana, murah hati, disenangi banyak kawan.';
      case 13: return 'Lakuning Lintang: Mempesona, mandiri, suka kedamaian dan keindahan.';
      case 14: return 'Lakuning Mbulan: Penerang dalam kegelapan, tutur kata menentramkan hati.';
      case 15: return 'Lakuning Srengenge: Berwibawa, berjiwa pemimpin, menjadi panutan kelompok.';
      case 16: return 'Lakuning Bumi: Pengayom, sabar, murah rezeki, teguh memegang prinsip.';
      case 17: return 'Lakuning Gunung: Pendiam namun kaya wawasan, kokoh dan dipercaya.';
      case 18: return 'Lakuning Paripurna: Karismatik, mengayomi, memiliki daya pengaruh besar.';
      default: return 'Memiliki keunikan karakter dan daya adaptasi yang luhur.';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs select-none">
      <div 
        className="w-full max-w-lg max-h-[90vh] flex flex-col bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-sky-900 text-white p-5 flex items-start justify-between relative overflow-hidden shrink-0">
          <div className="relative z-10">
            <div className="text-xs uppercase tracking-widest text-sky-200 font-bold mb-1 flex items-center gap-1.5">
              <span>Detail Penanggalan Tri-Kultur</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-baseline gap-2">
              <span>{date.toLocaleDateString('id-ID', { weekday: 'long' })},</span>
              <span>{date.getDate()} {date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span>
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-sky-100">
              <span className="bg-emerald-600/60 px-2 py-0.5 rounded border border-emerald-400/40 font-semibold">
                {hijri.day} {hijri.monthName} {hijri.year} H ({toArabicNumeral(hijri.day)})
              </span>
              <span className="bg-amber-500/30 px-2 py-0.5 rounded border border-amber-400/30 font-semibold text-amber-200">
                {jawa.day} {jawa.monthName} {jawa.year} ({jawa.windu})
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="relative z-10 p-1.5 rounded-full text-sky-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body (Scrollable) */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Weton & Primbon Card */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50/60 dark:from-stone-800/80 dark:to-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                  Weton & Neptu Jawa
                </span>
              </div>
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-500 text-amber-950">
                Neptu {neptu.totalNeptu}
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center py-2 bg-white/70 dark:bg-stone-900/60 rounded-lg border border-amber-100 dark:border-stone-800">
              <div>
                <div className="text-[10px] text-stone-500 dark:text-stone-400 uppercase font-semibold">Hari</div>
                <div className="text-sm font-bold text-stone-800 dark:text-stone-200">{neptu.hari}</div>
                <div className="text-xs text-amber-700 dark:text-amber-400 font-bold">({neptu.neptuHari})</div>
              </div>
              <div className="border-x border-stone-200 dark:border-stone-800">
                <div className="text-[10px] text-stone-500 dark:text-stone-400 uppercase font-semibold">Pasaran</div>
                <div className="text-sm font-bold text-stone-800 dark:text-stone-200">{neptu.pasaran}</div>
                <div className="text-xs text-amber-700 dark:text-amber-400 font-bold">({neptu.neptuPasaran})</div>
              </div>
              <div>
                <div className="text-[10px] text-stone-500 dark:text-stone-400 uppercase font-semibold">Weton Komplit</div>
                <div className="text-sm font-black text-amber-900 dark:text-amber-300">{neptu.weton}</div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">Total: {neptu.totalNeptu}</div>
              </div>
            </div>

            <p className="mt-2 text-xs text-stone-600 dark:text-stone-300 leading-relaxed italic">
              ✦ {getNeptuWatak(neptu.totalNeptu)}
            </p>
          </div>

          {/* Agenda & Kegiatan Yayasan (Jika ada) */}
          {dayData.adminEvents && dayData.adminEvents.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <span>🏛️</span>
                <span>Agenda Yayasan Ruang Belajar</span>
              </div>
              <div className="space-y-1.5">
                {dayData.adminEvents.map((aEv) => (
                  <div
                    key={aEv.id}
                    className="p-3 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 text-xs text-stone-900 dark:text-stone-100 flex items-center justify-between"
                  >
                    <div>
                      <strong className="text-emerald-900 dark:text-emerald-200 block">{aEv.title}</strong>
                      {aEv.description && <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-0.5">{aEv.description}</p>}
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-600 text-white uppercase shrink-0">
                      {aEv.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hari Libur & Agenda Penting */}
          {holidays.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                Hari Libur & Peringatan Nasional
              </div>
              <div className="space-y-1.5">
                {holidays.map((ev) => (
                  <div
                    key={ev.id}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                      ev.isHoliday
                        ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-700 dark:text-red-300'
                        : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200'
                    }`}
                  >
                    <span>{ev.title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      ev.isHoliday ? 'bg-red-600 text-white' : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
                    }`}>
                      {ev.isHoliday ? 'Libur Nasional' : 'Peringatan'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Catatan Pribadi & To-Do List Harian (Offline & Selain Google Calendar) */}
          <div className="space-y-2 pt-2 border-t border-stone-200 dark:border-stone-800">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <StickyNote className="w-3.5 h-3.5" />
                Catatan Pribadi & To-Do ({personalNotes.length})
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold border border-amber-300/40">
                Pribadi & Offline
              </span>
            </div>

            {/* Quick Add Note Form */}
            <form onSubmit={handleAddNote} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Tambah to-do atau catatan hari ini..."
                value={newNoteInput}
                onChange={(e) => setNewNoteInput(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs font-semibold bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="submit"
                disabled={!newNoteInput.trim()}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Simpan</span>
              </button>
            </form>

            {/* List Notes */}
            {personalNotes.length === 0 ? (
              <div className="p-3 bg-amber-50/40 dark:bg-stone-800/30 border border-amber-200/40 dark:border-stone-800 rounded-xl text-center">
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Belum ada catatan pribadi di tanggal ini. Tulis rencana atau tugas kecil Anda di atas.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                {personalNotes.map((note) => (
                  <div
                    key={note.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                      note.isDone
                        ? 'bg-stone-100 dark:bg-stone-800/40 border-stone-200 dark:border-stone-800 opacity-70'
                        : 'bg-white dark:bg-stone-800 border-amber-200 dark:border-stone-700 shadow-2xs'
                    }`}
                  >
                    <button
                      onClick={() => onTogglePersonalNote(note.id)}
                      className="p-0.5 text-stone-400 hover:text-emerald-600 transition-colors cursor-pointer shrink-0"
                    >
                      {note.isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Circle className="w-4 h-4 text-stone-400" />
                      )}
                    </button>
                    <span
                      className={`text-xs font-semibold flex-1 truncate ${
                        note.isDone
                          ? 'line-through text-stone-400 dark:text-stone-500'
                          : 'text-stone-800 dark:text-stone-100'
                      }`}
                    >
                      {note.title}
                    </span>
                    <button
                      onClick={() => onDeletePersonalNote(note.id)}
                      className="p-1 text-stone-400 hover:text-red-600 transition-colors cursor-pointer shrink-0"
                      title="Hapus catatan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Google Calendar Section */}
          <div className="space-y-2 pt-2 border-t border-stone-200 dark:border-stone-800">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Agenda Google Calendar ({googleEvents.length})
              </div>
              {isAuthenticated && (
                <button
                  onClick={() => onOpenAddEvent(date)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  Tambah Agenda
                </button>
              )}
            </div>

            {!isAuthenticated ? (
              <div className="p-4 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-xl text-center space-y-2">
                <p className="text-xs text-sky-800 dark:text-sky-300">
                  Hubungkan dengan Google Calendar untuk melihat & mengelola agenda daring Anda di kalender ini.
                </p>
                <button
                  onClick={onSignInPrompt}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
                >
                  Masuk dengan Google
                </button>
              </div>
            ) : googleEvents.length === 0 ? (
              <div className="p-4 bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 rounded-xl text-center">
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Belum ada agenda Google Calendar pada hari ini.
                </p>
                <button
                  onClick={() => onOpenAddEvent(date)}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Buat agenda baru untuk tanggal ini
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {googleEvents.map((gEvent) => (
                  <div
                    key={gEvent.id}
                    className="p-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl shadow-xs flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="font-bold text-sm text-stone-900 dark:text-stone-100 truncate">
                        {gEvent.summary}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                        <Clock className="w-3 h-3 shrink-0" />
                        <span>
                          {gEvent.start.dateTime
                            ? new Date(gEvent.start.dateTime).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'Sepanjang Hari'}
                        </span>
                        {gEvent.location && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 truncate">
                              <MapPin className="w-3 h-3 shrink-0" />
                              {gEvent.location}
                            </span>
                          </>
                        )}
                      </div>
                      {gEvent.description && (
                        <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-2 pt-0.5">
                          {gEvent.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {gEvent.htmlLink && (
                        <a
                          href={gEvent.htmlLink}
                          target="_blank"
                          rel="noreferrer"
                          title="Buka di Google Calendar"
                          className="p-1.5 text-stone-400 hover:text-blue-600 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={() => onRequestDeleteEvent(gEvent)}
                        title="Hapus Agenda"
                        className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-stone-50 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
