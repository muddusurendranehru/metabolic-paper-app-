"use client";

import { useState } from "react";
import { usePatients } from "@/lib/patient-store";
import { TabExtract } from "@/components/TabExtract";
import { TabVerify } from "@/components/tabs/TabVerify";
import { TabWaist } from "@/components/TabWaist";
import { TabAnalyze } from "@/components/TabAnalyze";
import { Tab5JCDR } from "@/components/tabs";
import { TabNavigation } from "@/components/layout/TabNavigation";
import { Footer } from "@/components/layout/Footer";

const MAIN_TABS = [
  { name: "📄 Extract PDFs", component: TabExtract },
  { name: "✅ Verify", component: TabVerify },
  { name: "📏 Edit Waist", component: TabWaist },
  { name: "📊 Analyze", component: TabAnalyze },
] as const;

const TABS = [
  ...MAIN_TABS,
  { name: "📄 Write JCDR", component: Tab5JCDR },
] as const;

export function HomeTabs({
  initialTab,
  initialPage,
}: {
  initialTab?: string;
  initialPage?: string;
}) {
  const { patients, setPatients } = usePatients();
  const [activeTab, setActiveTab] = useState(0);
  const isJCDRTab = activeTab === 4;
  const ActiveMainComponent = !isJCDRTab ? MAIN_TABS[activeTab].component : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 -m-4 p-4 -mb-6 rounded-lg">
      <header className="bg-white shadow-md border-b-4 border-indigo-600 rounded-t-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-indigo-900">
            TyG Index Research Study
          </h1>
          <p className="text-sm text-gray-600">
            Dr. Muddu Surendra Nehru | Professor Medicine | HOMA Clinic
          </p>
        </div>
      </header>

      <TabNavigation
        tabs={TABS.map((t) => ({ name: t.name }))}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {isJCDRTab ? (
          <Tab5JCDR
            patientData={patients}
            onBack={() => setActiveTab(3)}
          />
        ) : ActiveMainComponent ? (
          <ActiveMainComponent
            patientData={patients}
            setPatientData={setPatients}
          />
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
