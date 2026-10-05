import React, { useState } from 'react';
import { X, Copy, Check, Download, Code, FileCode } from 'lucide-react';
import { GAS_CODE_GS, GAS_INDEX_HTML } from '../data/gasTemplates';

interface GasSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const GasSyncModal: React.FC<GasSyncModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'codegs' | 'indexhtml'>('codegs');
  const [copied, setCopied] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    onShowToast(`Kode ${label} berhasil disalin!`, 'Silakan paste ke editor Google Apps Script.', 'success');
    setTimeout(() => setCopied(null), 2500);
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast(`File ${filename} berhasil diunduh!`, undefined, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-950/60 backdrop-blur-xs no-print">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-blue-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header with Blue Gradient */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-400 to-blue-500 text-white flex items-center justify-center shadow-xs">
              <Code className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                Source Code Google Apps Script (Code.gs & index.html)
              </h3>
              <p className="text-xs text-blue-200">
                Gunakan file ini untuk menjalankan aplikasi langsung di script.google.com
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-blue-200 hover:text-white p-1.5 rounded-lg hover:bg-blue-800/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection & Actions */}
        <div className="px-6 py-2.5 bg-blue-50/50 border-b border-blue-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('codegs')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition ${
                activeTab === 'codegs'
                  ? 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-blue-100/60 border border-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Code.gs (Backend GAS)</span>
            </button>
            <button
              onClick={() => setActiveTab('indexhtml')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition ${
                activeTab === 'indexhtml'
                  ? 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-blue-100/60 border border-slate-200'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>index.html (Frontend GAS)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'codegs' ? (
              <>
                <button
                  onClick={() => handleCopy(GAS_CODE_GS, 'Code.gs')}
                  className="px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-900 border border-blue-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                >
                  {copied === 'Code.gs' ? <Check className="w-3.5 h-3.5 text-blue-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Salin Code.gs</span>
                </button>
                <button
                  onClick={() => handleDownload(GAS_CODE_GS, 'Code.gs')}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Code.gs</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleCopy(GAS_INDEX_HTML, 'index.html')}
                  className="px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-900 border border-blue-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                >
                  {copied === 'index.html' ? <Check className="w-3.5 h-3.5 text-blue-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Salin index.html</span>
                </button>
                <button
                  onClick={() => handleDownload(GAS_INDEX_HTML, 'index.html')}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download index.html</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content Viewer */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs bg-slate-900 text-slate-100">
          <pre className="whitespace-pre-wrap leading-relaxed">
            {activeTab === 'codegs' ? GAS_CODE_GS : GAS_INDEX_HTML}
          </pre>
        </div>

        {/* Instructions */}
        <div className="px-6 py-3 bg-blue-50/60 border-t border-blue-200 text-xs text-slate-700">
          <p className="font-bold text-blue-950">Petunjuk Pemasangan di script.google.com:</p>
          <ol className="list-decimal pl-4 space-y-0.5 mt-1 text-[11px]">
            <li>Buka <a href="https://script.google.com" target="_blank" rel="noreferrer" className="text-blue-700 underline font-semibold">script.google.com</a> dan buat Proyek Baru.</li>
            <li>Ganti isi file <code className="bg-blue-100 text-blue-900 px-1 py-0.5 rounded font-mono">Code.gs</code> dengan kode di atas.</li>
            <li>Klik tombol <strong>+</strong> lalu pilih <strong>HTML</strong>, beri nama <code className="bg-blue-100 text-blue-900 px-1 py-0.5 rounded font-mono">index</code>, lalu paste kode <code className="bg-blue-100 text-blue-900 px-1 py-0.5 rounded font-mono">index.html</code>.</li>
            <li>Klik <strong>Deploy</strong> &gt; <strong>New Deployment</strong> &gt; Pilih jenis <strong>Web App</strong> &gt; Akses: <em>Anyone</em> &gt; Klik <strong>Deploy</strong>.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
