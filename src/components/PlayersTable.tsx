"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";

export type PlayerRow = {
  name: string;
  typed: string;
  wpm: number;
  accuracy: number;
};

export function PlayersTable({ data }: { data: PlayerRow[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns: ColumnDef<PlayerRow>[] = [
    {
      accessorKey: "name",
      header: "Player",
    },
    {
      accessorKey: "typed",
      header: "Live progress",
    },
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
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
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
              <td key={cell.id} className="border px-3 py-2">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
