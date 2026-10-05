import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, FolderUp, Maximize2, Minimize2, GraduationCap, Users, ShieldCheck } from 'lucide-react';
import { AppState } from '../types';

interface NavbarProps {
  appState: AppState;
  onExportExcel: () => void;
  onOpenGasModal?: () => void;
  onNavigateToExcel?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  appState,
  onExportExcel,
  onNavigateToExcel,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn('Error attempting to enable fullscreen:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch((err) => {
          console.warn('Error attempting to exit fullscreen:', err);
        });
      }
    }
  };

  const totalStudents = appState.students.length;
  const count6A = appState.students.filter((s) => s.classRoom === '6A').length;
  const count6B = appState.students.filter((s) => s.classRoom === '6B').length;
  const count6C = appState.students.filter((s) => s.classRoom === '6C').length;
  const count6D = appState.students.filter((s) => s.classRoom === '6D').length;

  return (
    <header className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white border-b border-blue-800/60 sticky top-0 z-40 w-full px-4 sm:px-6 lg:px-8 py-3 no-print shadow-lg transition-all duration-300">
      <div className="w-full flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left Branding & Live Stats */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md ring-2 ring-sky-300/40 shrink-0">
            01
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-white leading-tight tracking-tight drop-shadow-xs">
                {appState.school.name}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/40">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> Aktif
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-blue-200 mt-0.5 font-medium">
              <span className="text-sky-300 font-bold">Sistem Rapor & Ijazah Digital</span>
              <span aria-hidden="true" className="text-blue-400">·</span>
              <span>TP {appState.school.academicYear}</span>
              <span aria-hidden="true" className="text-blue-400">·</span>
              <span>NPSN: {appState.school.npsn}</span>
              <span aria-hidden="true" className="text-blue-400 hidden md:inline">·</span>
              <span className="text-sky-200 hidden md:inline font-semibold">
                Total {totalStudents} Siswa (6A: {count6A}, 6B: {count6B}, 6C: {count6C}, 6D: {count6D})
              </span>
            </div>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
          {/* Fullscreen Toggle Button */}
          <button
            onClick={toggleFullscreen}
            className="px-3.5 py-2 bg-blue-800/80 hover:bg-blue-700 active:bg-blue-900 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-xs border border-blue-600/50 cursor-pointer"
            title={isFullscreen ? 'Keluar dari Mode Layar Penuh' : 'Beralih ke Tampilan Layar Penuh (Fullscreen)'}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-4 h-4 text-sky-300" />
                <span className="hidden sm:inline">Normal Layar</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4 text-sky-300" />
                <span className="hidden sm:inline">Layar Penuh</span>
              </>
            )}
          </button>

          {/* Import Excel */}
          {onNavigateToExcel && (
            <button
              onClick={onNavigateToExcel}
              className="px-3.5 py-2 bg-indigo-700/90 hover:bg-indigo-600 active:bg-indigo-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all border border-indigo-400/40 shadow-xs cursor-pointer"
              title="Buka menu Impor File Excel"
            >
              <FolderUp className="w-4 h-4 text-sky-200" />
              <span>Impor Excel</span>
            </button>
          )}

          {/* Export Database Excel */}
          <button
            onClick={onExportExcel}
            className="px-4 py-2 bg-gradient-to-r from-sky-400 via-sky-500 to-blue-600 hover:from-sky-300 hover:to-blue-500 active:from-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-950/40 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            title="Download seluruh data siswa dan nilai dalam file Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Download Database Excel (.xlsx)</span>
          </button>
        </div>
      </div>
    </header>
  );
};
