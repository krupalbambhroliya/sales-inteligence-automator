'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, Loader2, Trash2 } from 'lucide-react';

export interface LeadRow {
  id: string;
  companyName: string;
  website: string;
  b2bDecision: string;
  inputType?: string;
  createdAt: string;
}

const ITEMS_PER_PAGE = 5;

export const LeadsTable: React.FC = () => {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) {
      return;
    }

    try {
      const res = await fetch(`/api/leads?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setLeads((prev) => prev.filter((lead) => lead.id !== id));
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to delete lead.');
      }
    } catch {
      alert('An error occurred while deleting the lead.');
    }
  };

  useEffect(() => {
    async function fetchLeads() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/leads');
        if (res.ok) {
          const dbLeads = await res.json();
          if (Array.isArray(dbLeads)) {
            const formatted: LeadRow[] = dbLeads.map((item: any) => ({
              id: item.id,
              companyName: item.companyName,
              website: item.website.replace(/^https?:\/\//i, ''),
              b2bDecision: item.b2bDecision,
              inputType: item.inputType,
              createdAt: item.createdAt
                ? new Date(item.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Jul 29, 2026',
            }));
            setLeads(formatted);
          }
        }
      } catch {
        // Handle error gracefully
      } finally {
        setIsLoading(false);
      }
    }

    fetchLeads();
  }, []);

  // Compute Pagination Bounds
  const totalPages = Math.max(1, Math.ceil(leads.length / ITEMS_PER_PAGE));

  // Ensure currentPage stays within valid bounds
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  // Paginated Rows Slice
  const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
  const paginatedLeads = leads.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePrevPage = () => {
    if (validCurrentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (validCurrentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleGoToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-50/60 text-xs font-semibold text-slate-500">
              <th className="py-4 px-6">Company Name</th>
              <th className="py-4 px-6">Input Type</th>
              <th className="py-4 px-6">B2B Status</th>
              <th className="py-4 px-6">Date</th>
              <th className="py-4 px-6 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/60 text-xs font-medium text-slate-700">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    <span>Loading database leads...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedLeads.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                  No researched leads found in database. Click &quot;+ New Research&quot; to add your first company!
                </td>
              </tr>
            ) : (
              paginatedLeads.map((lead) => {
                const isB2B = lead.b2bDecision?.toUpperCase() === 'YES';
                return (
                  <tr key={lead.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-6 font-bold text-slate-900">{lead.companyName}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-extrabold tracking-wider ${
                        lead.inputType === 'PDF' 
                          ? 'bg-purple-100 text-purple-700'
                          : lead.inputType === 'TEXT' || lead.inputType === 'COMPANY'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {lead.inputType === 'PDF'
                          ? 'Upload PDF'
                          : lead.inputType === 'TEXT' || lead.inputType === 'COMPANY'
                          ? 'Company Name'
                          : 'Website URL'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {isB2B ? (
                        <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-700 font-extrabold text-[10px] font-mono">
                          YES
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-md bg-rose-100 text-rose-700 font-extrabold text-[10px] font-mono">
                          NO
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-medium">
                      {new Date(lead.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link
                          href={`/result?id=${lead.id}`}
                          className="inline-flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(lead.id)}
                          className="inline-flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Lead"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Dynamic Functional Pagination Footer */}
      <div className="p-4 border-t border-slate-200/80 bg-slate-50/40 flex items-center justify-between text-xs text-slate-500">
        <button
          onClick={handlePrevPage}
          disabled={validCurrentPage <= 1}
          className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition flex items-center gap-1 ${
            validCurrentPage <= 1
              ? 'border-slate-200 bg-white text-slate-300 cursor-not-allowed'
              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 cursor-pointer shadow-sm'
          }`}
        >
          &lt; Previous
        </button>

        {/* Dynamic Page Number Buttons */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalPages }, (_, index) => {
            const pageNum = index + 1;
            const isActive = pageNum === validCurrentPage;
            return (
              <button
                key={pageNum}
                onClick={() => handleGoToPage(pageNum)}
                className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 cursor-pointer'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleNextPage}
          disabled={validCurrentPage >= totalPages}
          className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition flex items-center gap-1 ${
            validCurrentPage >= totalPages
              ? 'border-slate-200 bg-white text-slate-300 cursor-not-allowed'
              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 cursor-pointer shadow-sm'
          }`}
        >
          <span>Next</span> &gt;
        </button>
      </div>
    </div>
  );
};
