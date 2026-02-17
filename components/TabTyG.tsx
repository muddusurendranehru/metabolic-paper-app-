"use client";

import type { PatientRow } from "@/lib/tyg";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function TabTyG({
  patientData,
}: {
  patientData: PatientRow[];
  setPatientData: (arg: PatientRow[] | ((prev: PatientRow[]) => PatientRow[])) => void;
}) {

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>TyG formula</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p className="font-mono">TyG = ln(TG × Glucose / 2)</p>
          <p className="mt-2">Risk: TyG &gt; 9 → High; else Normal. Values in mg/dL.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Patient table (TyG calculated)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>TG</TableHead>
                <TableHead>Glucose</TableHead>
                <TableHead>HDL</TableHead>
                <TableHead>Waist</TableHead>
                <TableHead>TyG</TableHead>
                <TableHead>Risk</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patientData.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.age}</TableCell>
                  <TableCell>{p.tg}</TableCell>
                  <TableCell>{p.glucose}</TableCell>
                  <TableCell>{p.hdl}</TableCell>
                  <TableCell>{p.waist} cm</TableCell>
                  <TableCell>{p.tyg}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "rounded px-2 py-0.5 text-xs font-medium",
                        p.risk === "High"
                          ? "bg-destructive/20 text-destructive"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {p.risk}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
