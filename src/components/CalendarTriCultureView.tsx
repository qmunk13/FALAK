import React, { useState } from 'react';
import {
  Calendar,
  Sparkles,
  ArrowRight,
  Search,
  BookOpen,
  Info
} from 'lucide-react';
import {
  getHijriDate,
  getJawaDate,
  getPasaran,
  getNeptuInfo,
  toArabicNumeral,
  NAMA_BULAN
} from '../utils/calendarMath';

export const CalendarTriCultureView: React.FC = () => {
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const parsedDate = new Date(selectedDateStr + 'T12:00:00');
  const isValid = !isNaN(parsedDate.getTime());

  const pasaran = isValid ? getPasaran(parsedDate) : '';
  const hijri = isValid ? getHijriDate(parsedDate) : null;
  const jawa = isValid && hijri ? getJawaDate(parsedDate, hijri) : null;
  const neptu = isValid ? getNeptuInfo(parsedDate, pasaran) : null;

  // Primbon / watak neptu
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
    <div className="w-full space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950 via-stone-900 to-yellow-950 border border-amber-800/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-500 flex items-center justify-center text-white shadow-lg shadow-amber-700/30 shrink-0">
            <Calendar className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider border border-amber-400/30">
                Konversi Tri-Kultur
              </span>
              <span className="text-xs text-stone-300 font-arabic"> </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
              Kalender Masehi, Hijriyah & Jawa
            </h2>
            <p className="text-xs text-amber-200/90 mt-0.5">
              Integrasi penanggalan nasional Masehi, tahun Hijriyah Qamariyah, dan Kalender Jawa Sultan Agungan
            </p>
          </div>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 p-2 bg-black/40 rounded-2xl border border-white/10 text-xs">
          <span className="text-stone-400 font-semibold pl-2">Pilih Tanggal:</span>
          <input
            type="date"
            value={selectedDateStr}
            onChange={(e) => setSelectedDateStr(e.target.value)}
            className="bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1 text-white font-mono font-bold focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Result Cards Grid */}
      {isValid && neptu && hijri && jawa && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Penanggalan Masehi */}
          <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4">
            <div className="flex items-center gap-3 border-b border-stone-800 pb-3">
              <span className="font-bold text-xs uppercase tracking-wider text-blue-400">
                1. Penanggalan Masehi (Gregorian)
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-stone-400 text-xs">Hari & Tanggal:</span>
              <div className="text-xl font-black text-white">
                {parsedDate.toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
            </div>
            <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-xs text-stone-400 space-y-1">
              <div>Sistem: Solar (Syamsiyah)</div>
              <div>Jumlah hari setahun: {parsedDate.getFullYear() % 4 === 0 ? '366 hari (Kabisat)' : '365 hari (Basithah)'}</div>
            </div>
          </div>

          {/* Card 2: Penanggalan Hijriyah */}
          <div className="p-6 rounded-3xl bg-stone-900 border border-emerald-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <span className="font-bold text-xs uppercase tracking-wider text-emerald-400">
                2. Penanggalan Hijriyah
              </span>
              <span className="font-arabic text-emerald-400 text-base font-bold">
                {toArabicNumeral(hijri.day)}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-stone-400 text-xs">Tanggal Hijriyah:</span>
              <div className="text-xl font-black text-white">
                {hijri.day} {hijri.monthName} {hijri.year} H
              </div>
            </div>
            <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-xs text-stone-400 space-y-1">
              <div>Sistem: Lunar Murni (Qamariyah)</div>
              <div>Bulan ke-{hijri.month + 1} dari 12 bulan Hijriyah</div>
            </div>
          </div>

          {/* Card 3: Penanggalan Jawa & Weton */}
          <div className="p-6 rounded-3xl bg-stone-900 border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <span className="font-bold text-xs uppercase tracking-wider text-amber-400">
                3. Penanggalan Jawa & Weton
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-bold text-[10px] border border-amber-500/20">
                Neptu {neptu.totalNeptu}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-stone-400 text-xs">Weton Kelahiran / Hari:</span>
              <div className="text-xl font-black text-amber-300">
                {neptu.weton}
              </div>
            </div>
            <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-xs text-stone-400 space-y-1">
              <div>Tahun Jawa: {jawa.year} ({jawa.windu})</div>
              <div>Bulan Jawa: {jawa.monthName} ({jawa.day})</div>
              <div>Neptu: {neptu.hari} ({neptu.neptuHari}) + {neptu.pasaran} ({neptu.neptuPasaran}) = {neptu.totalNeptu}</div>
            </div>
          </div>
        </div>
      )}

      {/* Watak & Makna Primbon Weton */}
      {isValid && neptu && (
        <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-stone-200">
              Karakter Weton {neptu.weton} (Total Neptu {neptu.totalNeptu}):
            </span>
          </div>
          <p className="text-stone-300 leading-relaxed italic bg-stone-950 p-3 rounded-xl border border-stone-800">
            "{getNeptuWatak(neptu.totalNeptu)}"
          </p>
        </div>
      )}
    </div>
  );
};
