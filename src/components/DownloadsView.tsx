import React, { useRef } from 'react';
import { 
  Download, 
  FileText, 
  BookOpen, 
  Database, 
  Upload, 
  CheckCircle2, 
  ArrowDownToLine, 
  Sparkles, 
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import { CalendarKop, AdminEvent, PersonalNote } from '../types/calendar';

interface DownloadsViewProps {
  kop: CalendarKop;
  adminEvents: AdminEvent[];
  personalNotes: PersonalNote[];
  onImportBackup: (backup: any) => void;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

export const DownloadsView: React.FC<DownloadsViewProps> = ({
  kop,
  adminEvents,
  personalNotes,
  onImportBackup,
  onShowToast
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Backup Full JSON System Data
  const handleDownloadBackup = () => {
    const backupData = {
      institution: 'Yayasan Ruang Belajar',
      system: 'Sistem Kalender Nusantara & Hisab Sullamun Nayyirain',
      exportDate: new Date().toISOString(),
      kop,
      adminEvents,
      personalNotes
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `backup_yayasan_ruang_belajar_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    onShowToast('File backup data sistem berhasil diunduh!');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          onImportBackup(parsed);
          onShowToast('Data cadangan sistem berhasil dipulihkan!');
        } catch {
          onShowToast('Format file JSON tidak valid.', 'error');
        }
      };
      reader.readAsText(file);
    }
  };

  // Download Materi Falak Sullam Text Guide
  const handleDownloadFalakGuide = () => {
    const guideText = `===============================================================
PANDUAN ILMU FALAK: KITAB SULLAMUN NAYYIRAIN
Yayasan Ruang Belajar - Pusat Khazanah Falak Nusantara
===============================================================

Pengarang: Al-Allamah Asy-Syaikh Muhammad Manshur bin Abdul Hamid Al-Batawi (Jembatan Lima, Betawi)
Tahun Penyusunan: 1344 H / 1925 M

1. STRUKTUR SHEET HITUNGAN FALAK:
- ISIAN: Form variabel utama (Bulan, Tahun, Markaz Betawi/lokasi, Lintang, Bujur, Altitude mdpl).
- EPOCH: Harokat tetap pergerakan matahari dan bulan per hari dan per jam.
- MUADDALAH: Dapur koreksi matematis ta'dil (Meqowwam, Hisoh, Khossoh, Markaz).
- DATA MEEUS: Validasi komparasi algoritma astronomi Jean Meeus.
- BULANAN: Hari pasaran Jawa, jam Ijtima' WIB, Irtifa' Hilal hakiki & mar'i, Mukuts, Nurul Hilal.
- HASIL & HASIL ARAB: Rekapitulasi naskah resmi dalam bahasa Indonesia dan bahasa Arab.
- RUKYAT-CETAK: Format surat keputusan / berita acara resmi siap cetak.

2. KONSTANTA EPOCH HAROKAT PER HARI:
- Al-Alamah (الشمس الوسطى): 0° 59' 08" / hari
- Al-Khissoh (القمر الوسطي): 13° 10' 35" / hari
- Al-Khosoh (خاصة القمر): 13° 03' 54" / hari
- Al-Markaz (مركز التعديل): 12° 11' 27" / hari
- Al-Auj (أوج القمر): 0° 06' 41" / hari

3. KRITERIA HILAL MABIMS:
- Tinggi hilal mar'i minimal 3 derajat di atas ufuk.
- Sudut elongasi bulan-matahari minimal 6.4 derajat.

===============================================================
Yayasan Ruang Belajar &bull; yayasanruangbelajar1@gmail.com
===============================================================`;

    const blob = new Blob([guideText], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Panduan_Falak_Sullamun_Nayyirain_YayasanRuangBelajar.txt`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Modul panduan hisab falak berhasil diunduh!');
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-950 via-stone-900 to-indigo-950 text-white border border-blue-800/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-700/30 shrink-0">
            <Download className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold uppercase tracking-wider border border-blue-400/30">
                Pusat Unduhan & Cadangan
              </span>
              <span className="text-xs text-stone-300 font-arabic">مركز التحميل</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
              Pusat Unduhan (Download)
            </h2>
            <p className="text-xs text-blue-200/90 mt-0.5">
              Unduh dokumen falak, modul panduan, materi hisab, dan cadangan data sistem Yayasan Ruang Belajar
            </p>
          </div>
        </div>
      </div>

      {/* Grid Download Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Modul Falak Kitab Sullam */}
        <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">
              Modul Panduan Hisab Kitab Sullamun Nayyirain
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Panduan lengkap tata cara perhitungan hisab awal bulan Qamariyah, pemetaan sheet Excel, konstanta epoch harokat, dan rumus ta'dil muaddalah.
            </p>
          </div>

          <button
            onClick={handleDownloadFalakGuide}
            className="w-full py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-stone-700"
          >
            <ArrowDownToLine className="w-4 h-4 text-emerald-400" />
            <span>Unduh Modul Panduan Falak (TXT)</span>
          </button>
        </div>

        {/* Card 2: Backup Data Sistem Lengkap */}
        <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-600/20 text-amber-400 flex items-center justify-center">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">
              Cadangan Data Sistem (JSON Backup)
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Ekspor seluruh konfigurasi Kop Yayasan, catatan pribadi, dan agenda resmi yayasan ke dalam file JSON terenkripsi untuk keamanan data.
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleDownloadBackup}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md shadow-amber-600/20"
            >
              <ArrowDownToLine className="w-4 h-4" />
              <span>Unduh File Cadangan (JSON)</span>
            </button>

            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 px-4 rounded-xl bg-stone-950 hover:bg-stone-800 text-stone-400 hover:text-stone-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-stone-800"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Pulihkan Data dari File JSON</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
