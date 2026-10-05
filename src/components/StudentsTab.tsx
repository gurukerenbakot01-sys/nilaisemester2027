import React, { useState } from 'react';
import { UserPlus, Search, Eye, Edit2, Trash2 } from 'lucide-react';
import { AppState, ClassName, Student } from '../types';
import { formatIndoDate } from '../utils/calc';

interface StudentsTabProps {
  appState: AppState;
  onOpenAddModal: () => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onViewReport: (student: Student) => void;
}

export const StudentsTab: React.FC<StudentsTabProps> = ({
  appState,
  onOpenAddModal,
  onEditStudent,
  onDeleteStudent,
  onViewReport,
}) => {
  const [filterClass, setFilterClass] = useState<ClassName | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStudents = appState.students.filter((s) => {
    const matchesClass = filterClass === 'ALL' || s.classRoom === filterClass;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.nisn.includes(q) ||
      s.nis.includes(q) ||
      s.parentName.toLowerCase().includes(q);
    return matchesClass && matchesQuery;
  });

  return (
    <div className="bg-white p-5 rounded-2xl border border-blue-200/80 shadow-sm space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Filter Kelas:</span>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value as ClassName | 'ALL')}
              className="text-xs border border-blue-200 rounded-xl px-3 py-1.5 bg-white font-semibold text-blue-900 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
            >
              <option value="ALL">Semua Kelas (6A - 6D)</option>
              <option value="6A">Kelas 6A</option>
              <option value="6B">Kelas 6B</option>
              <option value="6C">Kelas 6C</option>
              <option value="6D">Kelas 6D</option>
            </select>
          </div>
          <span className="text-xs text-slate-500">
            Menampilkan <strong className="text-blue-950 font-bold">{filteredStudents.length}</strong> siswa
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama / NISN / NIS..."
              className="pl-8 pr-3 py-1.5 text-xs border border-blue-200 rounded-xl w-60 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <button
            onClick={onOpenAddModal}
            className="px-3.5 py-1.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white text-xs font-semibold rounded-xl shadow-sm flex items-center gap-1.5 transition"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Tambah Siswa</span>
          </button>
        </div>
      </div>

      {/* Table with Blue Gradient Header */}
      <div className="overflow-x-auto border border-blue-200/90 rounded-xl shadow-2xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white font-semibold">
            <tr>
              <th className="py-2.5 px-3 border-r border-blue-800/60 w-10 text-center">No</th>
              <th className="py-2.5 px-3 border-r border-blue-800/60 w-16 text-center">Kelas</th>
              <th className="py-2.5 px-3 border-r border-blue-800/60 w-36">NIS / NISN</th>
              <th className="py-2.5 px-3 border-r border-blue-800/60">Nama Siswa</th>
              <th className="py-2.5 px-2 border-r border-blue-800/60 w-12 text-center">L/P</th>
              <th className="py-2.5 px-3 border-r border-blue-800/60">Tempat, Tgl Lahir</th>
              <th className="py-2.5 px-3 border-r border-blue-800/60">Orang Tua / Wali</th>
              <th className="py-2.5 px-3 text-center w-48">Aksi & Dokumen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-100/70">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2 max-w-sm mx-auto">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <p className="font-bold text-blue-950 text-sm">
                      {appState.students.length === 0
                        ? 'Belum Ada Data Siswa'
                        : 'Tidak Ada Siswa yang Cocok'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {appState.students.length === 0
                        ? 'Data aplikasi saat ini dalam kondisi kosong. Silakan klik tombol "+ Tambah Siswa" untuk memulai input.'
                        : 'Coba ubah kata kunci pencarian atau pilih filter kelas lainnya.'}
                    </p>
                    {appState.students.length === 0 && (
                      <button
                        onClick={onOpenAddModal}
                        className="mt-2 px-4 py-2 bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs hover:from-blue-600 hover:to-indigo-600 transition"
                      >
                        + Tambah Siswa Pertama
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredStudents.map((s, idx) => (
                <tr key={s.id} className="hover:bg-blue-50/50 transition">
                  <td className="py-2.5 px-3 border-r border-blue-100 text-center num-font text-slate-500">
                    {idx + 1}
                  </td>
                  <td className="py-2.5 px-3 border-r border-blue-100 text-center">
                    <span className="font-bold text-blue-900 bg-blue-100/80 px-2 py-0.5 rounded border border-blue-200">
                      {s.classRoom}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 border-r border-blue-100 num-font text-slate-700">
                    {s.nis} / {s.nisn}
                  </td>
                  <td className="py-2.5 px-3 border-r border-blue-100 font-semibold text-slate-900">
                    {s.name}
                  </td>
                  <td className="py-2.5 px-2 border-r border-blue-100 text-center">
                    <span className={s.gender === 'L' ? 'text-blue-700 font-bold' : 'text-indigo-700 font-bold'}>
                      {s.gender}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 border-r border-blue-100 text-slate-600">
                    {s.birthPlace}, {formatIndoDate(s.birthDate)}
                  </td>
                  <td className="py-2.5 px-3 border-r border-blue-100 text-slate-600">
                    {s.parentName}
                  </td>
                  <td className="py-2.5 px-3 text-center space-x-1">
                    <button
                      onClick={() => onViewReport(s)}
                      className="px-2.5 py-1 bg-gradient-to-r from-blue-50 to-sky-100 hover:from-blue-100 hover:to-sky-200 text-blue-900 border border-blue-200 rounded-lg font-semibold text-[11px] inline-flex items-center gap-1 transition"
                      title="Lihat Rekap Rapor 6 Semester"
                    >
                      <Eye className="w-3 h-3 text-blue-700" />
                      <span>Lihat Rapor</span>
                    </button>
                    <button
                      onClick={() => onEditStudent(s)}
                      className="px-2 py-1 bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-900 rounded-lg text-[11px] inline-flex items-center gap-1 transition border border-slate-200"
                      title="Edit Data Siswa"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => onDeleteStudent(s.id)}
                      className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[11px] inline-flex items-center gap-1 transition border border-rose-200"
                      title="Hapus Siswa"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Hapus</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
