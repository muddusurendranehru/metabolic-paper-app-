"use client";

import * as React from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PatientRow } from "@/lib/tyg";
import { calcTyG, calcRisk } from "@/lib/tyg";
import { cn } from "@/lib/utils";

interface DataTableProps {
  data: PatientRow[];
  onDataChange: (data: PatientRow[]) => void;
}

export function DataTable({ data, onDataChange }: DataTableProps) {

  const updateRow = (id: string, updates: Partial<PatientRow>) => {
    const row = data.find((r) => r.id === id);
    if (!row) return;
    const next = { ...row, ...updates };
    if (updates.waist != null || updates.tg != null || updates.glucose != null) {
      next.tyg = Math.round(calcTyG(next.tg, next.glucose) * 100) / 100;
      next.risk = calcRisk(next.tyg);
    }
    onDataChange(
      data.map((r) => (r.id === id ? next : r))
    );
  };

  const columns: ColumnDef<PatientRow>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "age", header: "Age" },
    { accessorKey: "sex", header: "Sex" },
    { accessorKey: "tg", header: "TG" },
    { accessorKey: "glucose", header: "Glucose" },
    { accessorKey: "hdl", header: "HDL" },
    {
      accessorKey: "waist",
      header: "Waist (cm)",
      cell: ({ row }) => (
        <input
          type="number"
          className="w-16 rounded border bg-transparent px-2 py-1 text-right text-sm"
          value={row.original.waist}
          onChange={(e) =>
            updateRow(row.original.id, { waist: parseFloat(e.target.value) || 0 })
          }
        />
      ),
    },
    { accessorKey: "tyg", header: "TyG" },
    {
      accessorKey: "risk",
      header: "Risk",
      cell: ({ row }) => (
        <span
          className={cn(
            "rounded px-2 py-0.5 text-xs font-medium",
            row.original.risk === "High"
              ? "bg-destructive/20 text-destructive"
              : "bg-muted text-muted-foreground"
          )}
        >
          {row.original.risk}
        </span>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                No patients. Upload a PDF or add data.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
