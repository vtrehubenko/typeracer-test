"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type PlayerRow = {
  name: string;
  typed: string;
  wpm: number;
  accuracy: number;
};

export function PlayersTable({ data }: { data: PlayerRow[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialSorting = useMemo<SortingState>(() => {
    const sort = searchParams.get("sort");
    const dir = searchParams.get("dir");
    if (!sort) return [];
    return [{ id: sort, desc: dir === "desc" }];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [sorting, setSorting] = useState<SortingState>(initialSorting);

  const [pagination, setPagination] = useState<PaginationState>(() => ({
    pageIndex: Number(searchParams.get("page") ?? 0),
    pageSize: Number(searchParams.get("pageSize") ?? 10),
  }));

  const columns: ColumnDef<PlayerRow>[] = [
    { accessorKey: "name", header: "Player" },
    { accessorKey: "typed", header: "Live progress" },
    {
      accessorKey: "wpm",
      header: "WPM",
      cell: (info) => Math.round(info.getValue<number>()),
    },
    {
      accessorKey: "accuracy",
      header: "Accuracy",
      cell: (info) => `${Math.round(info.getValue<number>() * 100)}%`,
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // sync to URL
  useEffect(() => {
    const current = searchParams.toString();

    const params = new URLSearchParams(current);

    const s = sorting[0];
    if (s) {
      params.set("sort", s.id);
      params.set("dir", s.desc ? "desc" : "asc");
    } else {
      params.delete("sort");
      params.delete("dir");
    }

    params.set("page", String(pagination.pageIndex));
    params.set("pageSize", String(pagination.pageSize));

    const next = params.toString();
    if (next === current) return; // ✅ не делаем replace, если ничего не изменилось

    router.replace(`${pathname}?${next}`);
  }, [sorting, pagination, pathname, router, searchParams]);

  return (
    <div className="space-y-3">
      <table className="w-full border-collapse">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => (
                <th
                  key={header.id}
                  className="border px-3 py-2 cursor-pointer text-left"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="border px-3 py-2 align-top">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            className="border rounded px-3 py-1"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Prev
          </button>
          <button
            className="border rounded px-3 py-1"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </button>
          <span className="text-sm opacity-80">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm opacity-80">Rows:</span>
          <select
            className="border rounded px-2 py-1"
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
