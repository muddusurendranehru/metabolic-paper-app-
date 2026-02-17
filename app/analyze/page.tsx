"use client";

import React, { useMemo } from "react";
import { usePatients } from "@/lib/patient-store";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { correlation, correlationPValue } from "@/lib/tyg";
import { cn } from "@/lib/utils";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Scatter, Bar } from "react-chartjs-2";
import Link from "next/link";
import { Button } from "@/components/ui/button";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AnalyzePage() {
  const { patients } = usePatients();

  const { r, p, scatterData, boxData, heatmapMatrix } = useMemo(() => {
    const waist = patients.map((p) => p.waist);
    const tyg = patients.map((p) => p.tyg);
    const r = waist.length >= 2 ? correlation(waist, tyg) : 0;
    const p = waist.length >= 2 ? correlationPValue(r, waist.length) : 1;

    const scatterData = {
      datasets: [
        {
          label: "Waist vs TyG",
          data: patients.map((p) => ({ x: p.waist, y: p.tyg })),
          backgroundColor: "rgba(59, 130, 246, 0.6)",
          borderColor: "rgb(59, 130, 246)",
          pointRadius: 8,
        },
      ],
    };

    const highWaist = patients.filter((p) => p.risk === "High").map((p) => p.waist);
    const normalWaist = patients.filter((p) => p.risk === "Normal").map((p) => p.waist);
    const boxData = {
      labels: ["High", "Normal"],
      datasets: [
        {
          label: "Waist (cm)",
          data: [
            highWaist.length ? highWaist.reduce((a, b) => a + b, 0) / highWaist.length : 0,
            normalWaist.length
              ? normalWaist.reduce((a, b) => a + b, 0) / normalWaist.length
              : 0,
          ],
          backgroundColor: ["rgba(239, 68, 68, 0.6)", "rgba(34, 197, 94, 0.6)"],
        },
      ],
    };

    const heatmapMatrix = [
      [1, r, correlation(patients.map((x) => x.waist), patients.map((x) => x.tg)), correlation(patients.map((x) => x.waist), patients.map((x) => x.glucose))],
      [r, 1, correlation(patients.map((x) => x.tyg), patients.map((x) => x.tg)), correlation(patients.map((x) => x.tyg), patients.map((x) => x.glucose))],
      [correlation(patients.map((x) => x.waist), patients.map((x) => x.tg)), correlation(patients.map((x) => x.tyg), patients.map((x) => x.tg)), 1, correlation(patients.map((x) => x.tg), patients.map((x) => x.glucose))],
      [correlation(patients.map((x) => x.waist), patients.map((x) => x.glucose)), correlation(patients.map((x) => x.tyg), patients.map((x) => x.glucose)), correlation(patients.map((x) => x.tg), patients.map((x) => x.glucose)), 1],
    ];
    return { r, p, scatterData, boxData, heatmapMatrix };
  }, [patients]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        title: { display: true, text: "Waist vs TyG (scatter)" },
      },
      scales: {
        x: { title: { display: true, text: "Waist (cm)" } },
        y: { title: { display: true, text: "TyG" } },
      },
    }),
    []
  );

  const boxOptions = useMemo(
    () => ({
      responsive: true,
      plugins: {
        title: { display: true, text: "Mean Waist by Risk" },
      },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: "Waist (cm)" } },
      },
    }),
    []
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Analyze</h1>
        <Button asChild variant="outline" size="sm">
          <Link href="/export">Export</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patient table</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Sex</TableHead>
                <TableHead>TG</TableHead>
                <TableHead>Glucose</TableHead>
                <TableHead>HDL</TableHead>
                <TableHead>Waist</TableHead>
                <TableHead>TyG</TableHead>
                <TableHead>Risk</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.age}</TableCell>
                  <TableCell>{p.sex}</TableCell>
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

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="h-[280px]">
              <Scatter data={scatterData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Correlation heatmap (Waist, TyG, TG, Glucose)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-1 text-center text-xs">
              {["", "Waist", "TyG", "TG", "Glucose"].map((h, i) => (
                <div key={i} className="font-medium">
                  {h}
                </div>
              ))}
              {["Waist", "TyG", "TG", "Glucose"].map((rowLabel, i) => (
                <React.Fragment key={i}>
                  <div className="font-medium text-left">{rowLabel}</div>
                  {heatmapMatrix[i].map((v, j) => (
                    <div
                      key={j}
                      className="rounded p-1 text-[10px]"
                      style={{
                        backgroundColor: `rgba(59, 130, 246, ${Math.abs(v)})`,
                        color: Math.abs(v) > 0.5 ? "white" : "inherit",
                      }}
                    >
                      {v.toFixed(2)}
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Risk vs Waist (mean by category)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[240px]">
            <Bar data={boxData} options={boxOptions} />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Mean waist by risk category.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            Correlation (Waist vs TyG): <strong>r = {r.toFixed(2)}</strong>,{" "}
            <strong>p {p < 0.001 ? "< 0.001" : `= ${p.toFixed(3)}`}</strong>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
