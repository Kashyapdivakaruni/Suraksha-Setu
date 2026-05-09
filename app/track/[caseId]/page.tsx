"use client";

import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Ambulance, Building2, MapPin, PhoneCall, ShieldCheck, Clock, Crosshair, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const TrackingMap = dynamic(() => import("@/components/maps/TrackingMap"), {
  ssr: false,
  loading: () => <div className="w-full h-[500px] bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-slate-400 font-bold">Loading Live Map...</div>
});

export default function PublicTrackingPage({ params }: { params: { caseId: string } }) {
  const [caseData, setCaseData] = useState<any>(null);

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const res = await fetch(`/api/ems/case/${params.caseId}`);
        if (res.ok) {
          const data = await res.json();
          setCaseData(data.emergencyCase);
        }
      } catch (err) {}
    };
    
    fetchCase();
    const interval = setInterval(fetchCase, 5000);
    return () => clearInterval(interval);
  }, [params.caseId]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-lg space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <Activity className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Live Emergency Tracking</h1>
          <p className="text-slate-500 mt-1">Secure Family Link for Case #{params.caseId.slice(0,6)}</p>
        </div>

        {/* Check if case exists and is for a registered patient */}
        {caseData && caseData.identityStatus === "UNVERIFIED" ? (
          // Unknown patient case - no tracking available
          <Card className="border-red-200 bg-red-50 shadow-md">
            <CardContent className="p-6 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-red-900 mb-2">Tracking Not Available</h2>
                <p className="text-red-700 mb-4">
                  This case is for an unregistered/unknown patient. Live tracking is only available for registered citizens with verified emergency contact information.
                </p>
                <p className="text-sm text-red-600 font-medium mb-4">
                  Status: <span className="font-bold">{caseData.status?.replace("_", " ") || "ACTIVE"}</span>
                </p>
              </div>
              <div className="bg-red-100 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">
                  <strong>For Emergency:</strong> Please call 112 or contact the hospital directly.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Verified patient - show full tracking interface
          <>
        {/* Mock Map */}
        <Card className="overflow-hidden border-2 border-slate-200 shadow-lg">
          <div className="h-[400px] w-full relative z-0">
            {caseData && (
              <TrackingMap 
                accidentLat={caseData.accidentLatitude || 17.3850} 
                accidentLng={caseData.accidentLongitude || 78.4867}
                hospitalLat={caseData.hospitalResponses?.[0]?.hospital?.latitude}
                hospitalLng={caseData.hospitalResponses?.[0]?.hospital?.longitude}
              />
            )}
          </div>

          <CardContent className="bg-white p-6 border-t">
            <div className="flex justify-between items-center mb-6">
              <div>
                <div className="text-sm font-bold text-slate-800">Destination:</div>
                <div className="text-lg font-black text-blue-700">{caseData?.hospitalResponses?.[0]?.hospital?.hospitalName || "Pending Hospital Assignment"}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-slate-800">ETA:</div>
                <div className="text-2xl font-black text-orange-600">{caseData?.ambulanceEtaMinutes || ((caseData?.id?.charCodeAt(0) || 0) % 15) + 5}<span className="text-sm ml-1">mins</span></div>
              </div>
            </div>

            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
              
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-green-500 text-slate-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded border shadow-sm">
                  <div className="font-bold text-slate-800 text-sm mb-1">Identity Verified by EMS</div>
                  <div className="text-xs text-slate-500">10:42 AM</div>
                </div>
              </div>

              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-green-500 text-slate-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded border shadow-sm">
                  <div className="font-bold text-slate-800 text-sm mb-1">Hospital Alerted & Preparing</div>
                  <div className="text-xs text-slate-500">10:45 AM</div>
                </div>
              </div>

              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-blue-500 text-slate-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <Ambulance className="w-5 h-5 animate-pulse" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded border shadow-sm border-blue-200">
                  <div className="font-bold text-blue-800 text-sm mb-1">Ambulance En Route</div>
                  <div className="text-xs text-blue-600">Live Status</div>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Privacy Footer */}
        <div className="bg-white p-4 rounded-xl border flex items-start gap-3 shadow-sm">
          <ShieldCheck className="w-6 h-6 text-green-600 shrink-0" />
          <div className="text-sm text-slate-600">
            <strong>Privacy Safe Tracking:</strong> Sensitive medical details, personal addresses, and contact numbers are hidden on this public tracking page for security.
          </div>
        </div>

        <Link href="tel:112" className="block w-full">
          <Button variant="outline" className="w-full h-14 bg-slate-900 text-white hover:bg-slate-800 border-none font-bold text-lg">
            <PhoneCall className="w-5 h-5 mr-3" /> Call Emergency 112
          </Button>
        </Link>
        </>
        )}
        
        <div className="text-center pt-4">
          <Link href="/" className="text-sm font-bold text-blue-600 hover:underline">
            Powered by Suraksha Setu
          </Link>
        </div>
      </div>
    </div>
  );
}
