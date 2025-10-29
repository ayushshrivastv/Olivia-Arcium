/**
 * Olivia: Decentralised Permissionless Predicition Market 
 * Copyright (c) 2025 Ayush Srivastava
 *
 * Licensed under the Apache 2.0
 */

import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useCallback } from 'react';

export const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  const generatePageNumbers = useCallback(() => {
    const maxVisiblePages = 3;
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = new Set<number>([1, totalPages, currentPage]);
    if (currentPage > 1) pages.add(currentPage - 1);
    if (currentPage < totalPages) pages.add(currentPage + 1);
    return Array.from(pages).sort((a, b) => a - b);
  }, [currentPage, totalPages]);

  const pageNumbers = generatePageNumbers();

  return (
    <div className="flex items-center justify-center px-4 py-3 border-t border-zinc-800 space-x-2">
      <button
        className="w-7 h-7 flex items-center justify-center rounded-full bg-transparent text-zinc-400 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>
      {pageNumbers.map((page, index) => {
        const needsEllipsisBefore =
          index > 0 && pageNumbers[index - 1] !== page - 1;
        const needsEllipsisAfter =
          index < pageNumbers.length - 1 && pageNumbers[index + 1] !== page + 1;
        return (
          <React.Fragment key={page}>
            {needsEllipsisBefore && (
              <div className="text-zinc-500 text-xs mx-1">...</div>
            )}
            <button
              className={`w-7 h-7 flex items-center justify-center rounded-full text-xs ${
                page === currentPage
                  ? 'bg-[#5522e0] text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
              onClick={() => onPageChange(page)}
              aria-label={`Page ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
            {needsEllipsisAfter && (
              <div className="text-zinc-500 text-xs mx-1">...</div>
            )}
          </React.Fragment>
        );
      })}
      <button
        className="w-7 h-7 flex items-center justify-center rounded-full bg-transparent text-zinc-400 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
