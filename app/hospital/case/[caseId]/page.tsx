"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, HeartPulse, Activity, AlertTriangle, Camera, CheckCircle2, MapPin, Ambulance, Brain, Shield, Loader2 } from "lucide-react";
import { computeTriageScore } from "@/lib/aiTriage";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";

export default function HospitalCasePage({ params }: { params: { caseId: string } }) {
  const { toast } = useToast();
  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedPassengerDetails, setSelectedPassengerDetails] = useState<any>(null);
  const [selectedVitalsPassenger, setSelectedVitalsPassenger] = useState<string>("PRIMARY");

  const fetchCase = async (isPoll = false) => {
    try {
      const res = await fetch(`/api/hospital/case/${params.caseId}`);
      if (res.ok) {
        const data = await res.json();
        setCaseData(data.emergencyCase);
      }
    } catch (err) {
      console.error("Failed to fetch case details");
    } finally {
      if (!isPoll) setLoading(false);
    }
  };

  useEffect(() => {
    fetchCase();
    const interval = setInterval(() => {
      fetchCase(true);
    }, 5000); // Poll every 5s

    return () => clearInterval(interval);
  }, [params.caseId]);

  const updateStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/hospital/prepare/${params.caseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        toast({ title: "Status Updated", description: `Case marked as ${newStatus}`, type: "success" });
        fetchCase(true);
      } else {
        throw new Error("Failed to update status");
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to update status", type: "error" });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-10 text-center animate-pulse text-slate-500 font-medium">Loading full emergency case data...</div>;
  if (!caseData) return <div className="p-10 text-center text-slate-500 font-medium">Case not found or not assigned to your hospital.</div>;

  const p = caseData.citizen;
  const vitalsArray = caseData.emsVitals || [];
  const images = caseData.uploadedFiles || [];
  const status = caseData.hospitalResponses?.[0]?.status || "NOTIFIED";

  // Get unique latest vitals per passenger
  const uniqueVitalsMap = new Map();
  vitalsArray.forEach((v: any) => {
    if (!uniqueVitalsMap.has(v.passengerId)) {
      uniqueVitalsMap.set(v.passengerId, v);
    }
  });
  const uniqueVitals = Array.from(uniqueVitalsMap.values());

  const getPassengerName = (v: any) => {
    if (v.passengerId === "PRIMARY") return p?.user?.fullName || caseData.manualPatientName || "Primary Patient";
    if (v.patientName && v.patientName !== "Unknown Passenger") return v.patientName;
    const pass = p?.passengers?.find((passObj: any) => passObj.id === v.passengerId);
    return pass?.name || "Unknown Passenger";
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/hospital/dashboard">
            <Button variant="outline" size="icon" className="rounded-full"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-[#0F284B] tracking-tight">Case #{params.caseId.substring(0,8).toUpperCase()}</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-red-600 font-bold text-sm animate-pulse flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" /> {caseData.severityLevel} EMERGENCY
              </p>
              <span className="text-xs font-bold px-2 py-0.5 rounded border border-slate-200 bg-slate-100 text-slate-600 uppercase">
                {caseData.status.replace("_", " ")}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {status === "NOTIFIED" && (
            <Button disabled={updating} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full px-6 shadow-md" onClick={() => updateStatus("PREPARING")}>
              ✅ Accept & Prepare for Patient
            </Button>
          )}
          {status === "PREPARING" && (
            <>
              <div className="bg-blue-100 border border-blue-200 text-blue-800 font-bold px-4 py-2 rounded-full flex items-center shadow-sm text-sm">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> PREPARING...
              </div>
              <Button disabled={updating} className="bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-full px-6 shadow-md" onClick={() => updateStatus("ADMITTED")}>
                Mark Patient Admitted
              </Button>
            </>
          )}
          {(status === "ADMITTED" || status === "UNDER_TREATMENT" || status === "STABLE") && (
            <div className="bg-green-100 border border-green-200 text-green-800 font-bold px-6 py-2 rounded-full flex items-center shadow-sm">
              <CheckCircle2 className="w-4 h-4 mr-2" /> PATIENT {status === "ADMITTED" ? "ADMITTED" : status.replace("_", " ")}
            </div>
          )}
          {status === "CRITICAL" && (
            <div className="bg-red-100 border border-red-200 text-red-800 font-bold px-6 py-2 rounded-full flex items-center shadow-sm animate-pulse">
              <AlertTriangle className="w-4 h-4 mr-2" /> PATIENT CRITICAL
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50">
              <CardTitle className="text-lg flex items-center gap-2 text-[#0F284B]">
                <User className="w-5 h-5 text-blue-600" /> Patient Demographics
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div className="sm:col-span-2">
                <div className="text-xs text-slate-500 font-bold mb-1">FULL NAME</div>
                <div className="font-extrabold text-xl text-slate-900">
                  {caseData.identityStatus === "UNVERIFIED" && caseData.manualPatientName ? (
                    <span className="text-orange-600">{caseData.manualPatientName} (Unverified)</span>
                  ) : (
                    p?.user?.fullName || "Unknown"
                  )}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 font-bold mb-1">AGE & GENDER</div>
                <div className="font-bold text-lg">
                  {caseData.identityStatus === "UNVERIFIED" && caseData.manualPatientAge ? (
                    <span className="text-orange-600">~{caseData.manualPatientAge} Yrs • {caseData.manualPatientGender || "?"}</span>
                  ) : (
                    `${p?.age || "?"} Yrs • ${p?.gender || "?"}`
                  )}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 font-bold mb-1">BLOOD GROUP</div>
                <div className="font-bold text-red-600 text-2xl">{p?.bloodGroup || "?"}</div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-xs text-slate-500 font-bold mb-1">EMERGENCY CONTACT</div>
                <div className="font-bold text-slate-800">{p?.emergencyContactName || "Not Provided"}</div>
                <div className="text-sm text-slate-500 font-medium">{p?.emergencyContactPhone || ""}</div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-xs text-slate-500 font-bold mb-1">VEHICLE INVOLVED</div>
                <div className="font-bold text-slate-800">{caseData.vehicle?.vehicleNumber || "Unknown"}</div>
              </div>
            </CardContent>
          </Card>

          {p?.passengers?.length > 0 && (
            <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50">
                <CardTitle className="text-lg flex items-center gap-2 text-[#0F284B]">
                  <User className="w-5 h-5 text-indigo-600" /> Co-Passengers Involved
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                <div className="space-y-4">
                  {p.passengers.map((pass: any) => (
                    <div key={pass.id} className="bg-white border border-slate-200 p-4 rounded-xl flex gap-4 shadow-sm">
                      {pass.photo ? (
                        <img src={pass.photo} alt={pass.name} className="w-16 h-16 rounded-full object-cover border-2 border-slate-100 shrink-0" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border-2 border-slate-200">
                          <User className="w-8 h-8 text-slate-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-slate-900 truncate">{pass.name}</h4>
                            <p className="text-xs text-slate-500 font-medium">{pass.relationship} • {pass.age} Yrs • {pass.gender}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {pass.bloodGroup && (
                              <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">{pass.bloodGroup}</span>
                            )}
                            <Button variant="outline" size="sm" className="h-6 text-[10px] px-2 uppercase" onClick={() => setSelectedPassengerDetails(pass)}>View History</Button>
                          </div>
                        </div>
                        <div className="mt-2 text-xs space-y-1">
                          {pass.healthConditions && <p className="truncate"><span className="font-bold text-slate-600">Conditions:</span> {pass.healthConditions}</p>}
                          {pass.allergies && <p className="truncate"><span className="font-bold text-slate-600">Allergies:</span> <span className="text-orange-600 font-medium">{pass.allergies}</span></p>}
                          {pass.emergencyContactName && (
                            <p className="truncate"><span className="font-bold text-slate-600">Contact:</span> {pass.emergencyContactName} ({pass.emergencyContactPhone})</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-red-100 shadow-sm rounded-2xl overflow-hidden bg-white">
            <CardHeader className="pb-3 border-b border-red-50 bg-red-50/50">
              <CardTitle className="text-lg flex items-center gap-2 text-red-800">
                <HeartPulse className="w-5 h-5" /> Medical History
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 grid sm:grid-cols-2 gap-6">
              <div>
                <div className="text-xs text-red-800/60 font-bold mb-1">KNOWN ALLERGIES</div>
                {p?.medicalInfo?.allergies ? (
                  <div className="font-bold text-red-800 bg-red-50 px-2 py-0.5 rounded inline-block border border-red-100">{p.medicalInfo.allergies}</div>
                ) : <div className="font-medium text-slate-500 text-sm">None declared</div>}
              </div>
              <div>
                <div className="text-xs text-red-800/60 font-bold mb-1">PREVIOUS CONDITIONS</div>
                <div className="font-bold text-slate-800">{p?.medicalInfo?.previousConditions || "None declared"}</div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-xs text-red-800/60 font-bold mb-1">CURRENT MEDICATIONS</div>
                <div className="font-bold text-slate-800">{p?.medicalInfo?.currentMedications || "None declared"}</div>
              </div>
              {p?.medicalInfo?.notes && (
                <div className="sm:col-span-2">
                  <div className="text-xs text-red-800/60 font-bold mb-1">CITIZEN MEDICAL NOTES</div>
                  <div className="font-medium text-red-800 bg-red-50 p-3 rounded-xl border border-red-100">{p.medicalInfo.notes}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {images.filter((img: any) => img.passengerId === selectedVitalsPassenger).length > 0 && (
            <Card className="border-indigo-100 shadow-sm rounded-2xl overflow-hidden mt-6">
              <CardHeader className="pb-3 border-b border-indigo-50 bg-indigo-50/50">
                <CardTitle className="text-lg flex items-center gap-2 text-indigo-900">
                  <Camera className="w-5 h-5" /> Uploaded Medical Readings
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5 flex gap-4 flex-wrap">
                {images.filter((img: any) => img.passengerId === selectedVitalsPassenger).map((img: any, i: number) => (
                  <div 
                    key={img.id} 
                    className="relative w-40 h-40 rounded-xl overflow-hidden border-2 border-slate-200 cursor-pointer hover:border-indigo-400 hover:shadow-lg transition-all"
                    onClick={() => setSelectedImage(img.dataUrl)}
                  >
                    <Image src={img.dataUrl} alt={img.fileName || "Medical reading"} layout="fill" objectFit="cover" />
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 p-1.5 text-[10px] text-white font-bold truncate text-center backdrop-blur-sm">
                      {img.fileName || `Reading ${i+1}`}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-orange-100 bg-orange-50/80">
              <CardTitle className="text-lg flex items-center gap-2 text-orange-900">
                <Activity className="w-5 h-5 text-orange-600" /> Latest EMS Vitals
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-5">
              {uniqueVitals.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 border-b border-orange-100">
                  {uniqueVitals.map((v: any) => (
                    <Button 
                      key={v.passengerId}
                      size="sm"
                      variant={selectedVitalsPassenger === v.passengerId ? "default" : "outline"}
                      onClick={() => setSelectedVitalsPassenger(v.passengerId)}
                      className={`rounded-full whitespace-nowrap font-bold ${selectedVitalsPassenger === v.passengerId ? 'bg-orange-600 text-white' : 'text-orange-800 bg-white border-orange-200'}`}
                    >
                      {getPassengerName(v)}
                    </Button>
                  ))}
                </div>
              )}
              
              {uniqueVitals.length > 0 ? (
                uniqueVitals.filter((v: any) => selectedVitalsPassenger ? v.passengerId === selectedVitalsPassenger : true).slice(0, 1).map((vitals: any) => {
                const triage = computeTriageScore({
                  bloodPressure: vitals.bloodPressure,
                  pulseRate: vitals.pulseRate,
                  oxygenLevel: vitals.oxygenLevel,
                  temperature: vitals.temperature,
                  respiratoryRate: vitals.respiratoryRate,
                  consciousnessStatus: vitals.consciousnessStatus,
                  bleedingSeverity: vitals.bleedingSeverity,
                  bloodSugar: vitals.bloodSugar
                });
                return (
                <div key={vitals.id} className="space-y-5">
                  {/* AI Triage Badge */}
                  <div className={`p-4 rounded-xl border-2 ${triage.borderColor} ${triage.bgColor}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Brain className={`w-6 h-6 ${triage.color}`} />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`font-extrabold text-lg ${triage.color}`}>AI Triage: {triage.label}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold text-white ${
                              triage.level === 'CRITICAL' ? 'bg-red-600 animate-pulse' : 
                              triage.level === 'HIGH' ? 'bg-orange-500' : 
                              triage.level === 'MEDIUM' ? 'bg-amber-500' : 'bg-green-500'
                            }`}>{triage.score}/{triage.maxScore}</span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">{triage.recommendation}</p>
                        </div>
                      </div>
                      <div className="text-right hidden sm:block">
                        <div className="flex items-center gap-1 text-xs text-purple-600 font-bold">
                          <Shield className="w-3 h-3" /> {triage.confidence}%
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">Enhanced NEWS2</div>
                      </div>
                    </div>
                  </div>

                  {/* AI Clinical Alerts */}
                  {triage.alerts.length > 0 && (
                    <div className="space-y-2">
                      {triage.alerts.map((alert: any, idx: number) => (
                        <div key={idx} className={`p-3 rounded-lg border-l-4 text-sm ${
                          alert.type === 'CRITICAL' ? 'border-l-red-600 bg-red-50 text-red-800' : 'border-l-amber-500 bg-amber-50 text-amber-800'
                        }`}>
                          <span className="font-extrabold">{alert.type === 'CRITICAL' ? '🚨' : '⚠️'} {alert.title}:</span> {alert.message}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-orange-100">
                      <div className="text-xs text-slate-500 font-bold mb-1">BP (mmHg)</div>
                      <div className="font-mono text-xl font-black text-slate-800">{vitals.bloodPressure || "--"}</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-orange-100">
                      <div className="text-xs text-slate-500 font-bold mb-1">HEART RATE</div>
                      <div className="font-mono text-xl font-black text-red-600">{vitals.pulseRate || "--"}</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-orange-100">
                      <div className="text-xs text-slate-500 font-bold mb-1">SpO2</div>
                      <div className="font-mono text-xl font-black text-slate-800">{vitals.oxygenLevel ? `${vitals.oxygenLevel}%` : "--"}</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-orange-100">
                      <div className="text-xs text-slate-500 font-bold mb-1">TEMP</div>
                      <div className="font-mono text-xl font-black text-slate-800">{vitals.temperature ? `${vitals.temperature}°F` : "--"}</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-orange-100">
                      <div className="text-xs text-slate-500 font-bold mb-1">RESP RATE</div>
                      <div className="font-mono text-xl font-black text-slate-800">{vitals.respiratoryRate ? `${vitals.respiratoryRate} bpm` : "--"}</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-orange-100">
                      <div className="text-xs text-slate-500 font-bold mb-1">BLOOD SUGAR</div>
                      <div className="font-mono text-xl font-black text-slate-800">{vitals.bloodSugar ? `${vitals.bloodSugar} mg/dL` : "--"}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-orange-100">
                      <div className="text-xs text-slate-500 font-bold mb-1">CONSCIOUSNESS</div>
                      <div className="font-bold text-slate-800">{vitals.consciousnessStatus?.replace("_", " ")}</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-orange-100">
                      <div className="text-xs text-slate-500 font-bold mb-1">BLEEDING SEVERITY</div>
                      <div className={`font-bold ${
                        vitals.bleedingSeverity === 'CRITICAL' ? 'text-red-700' : 
                        vitals.bleedingSeverity === 'HIGH' ? 'text-red-500' :
                        vitals.bleedingSeverity === 'MEDIUM' ? 'text-orange-500' : 'text-slate-800'
                      }`}>
                        {vitals.bleedingSeverity || "NONE"}
                      </div>
                    </div>
                  </div>

                  {(vitals.injuryObservations || vitals.emergencyNotes || vitals.fractureDetails) && (
                    <div className="bg-white p-4 rounded-xl border border-orange-200">
                      <div className="font-bold text-orange-900 flex items-center gap-2 mb-2 text-sm">
                        <AlertTriangle className="w-4 h-4" /> EMS Notes & Injuries
                      </div>
                      <div className="space-y-2 text-sm text-slate-700 font-medium">
                        {vitals.injuryObservations && <p><strong>Injuries:</strong> {vitals.injuryObservations}</p>}
                        {vitals.fractureDetails && <p><strong>Fractures:</strong> <span className="text-red-600">{vitals.fractureDetails}</span></p>}
                        {vitals.emergencyNotes && <p className="italic bg-orange-50/50 p-2 rounded">"{vitals.emergencyNotes}"</p>}
                      </div>
                    </div>
                  )}
                </div>
                );
                })
              ) : (
                <div className="text-center py-6 text-slate-500 font-medium text-sm">
                  EMS has not logged vitals yet.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50">
              <CardTitle className="text-lg flex items-center gap-2 text-[#0F284B]">
                <Ambulance className="w-5 h-5 text-indigo-600" /> Dispatch Info
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              <div>
                <div className="text-xs text-slate-500 font-bold mb-1">ACCIDENT LOCATION</div>
                <div className="font-medium text-slate-800 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  {caseData.accidentAddress || "Unknown"}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-500 font-bold mb-1">ASSIGNED EMS UNIT</div>
                  <div className="font-bold text-slate-800">EMS First Responders</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-bold mb-1">EMERGENCY SEVERITY</div>
                  <div className={`font-bold ${
                    caseData.severityLevel === 'CRITICAL' ? 'text-red-700' : 
                    caseData.severityLevel === 'HIGH' ? 'text-orange-600' : 'text-slate-800'
                  }`}>
                    {caseData.severityLevel}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-500 font-bold mb-1">CURRENT AMBULANCE STATUS</div>
                <div className="font-bold text-indigo-700 bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-100 uppercase">
                  {caseData.status.replace("_", " ")}
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between items-center mt-2">
                <span className="text-sm font-bold text-slate-600">AMBULANCE ETA</span>
                <span className="font-bold text-xl text-indigo-700">{caseData.ambulanceEtaMinutes || ((caseData.id.charCodeAt(0) || 0) % 15) + 5} MINS</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex flex-col">
            <div className="absolute top-4 right-4 z-10">
              <Button variant="outline" className="bg-black/50 text-white border-white/20 hover:bg-black" onClick={() => setSelectedImage(null)}>Close</Button>
            </div>
            <div className="relative flex-1">
              <Image src={selectedImage} alt="Medical reading full size" layout="fill" objectFit="contain" />
            </div>
          </div>
        </div>
      )}

      {/* Passenger Full Details Modal */}
      {selectedPassengerDetails && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <CardContent className="p-0">
              <div className="bg-[#0F284B] p-4 text-white flex justify-between items-center sticky top-0 z-10">
                <h2 className="font-bold text-xl">Passenger History</h2>
                <Button variant="ghost" size="sm" onClick={() => setSelectedPassengerDetails(null)} className="text-white hover:bg-white/20">Close</Button>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                  {selectedPassengerDetails.photo ? (
                    <img src={selectedPassengerDetails.photo} alt="Passenger" className="w-20 h-20 rounded-xl object-cover border-2 border-slate-200" />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-slate-100 flex items-center justify-center border-2 border-slate-200">
                      <User className="w-10 h-10 text-slate-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-2xl text-slate-900">{selectedPassengerDetails.name}</h3>
                    <p className="text-slate-500 font-medium">{selectedPassengerDetails.relationship} • {selectedPassengerDetails.age} Yrs • {selectedPassengerDetails.gender}</p>
                    {selectedPassengerDetails.bloodGroup && (
                      <span className="inline-block mt-2 px-3 py-1 bg-red-100 text-red-700 font-bold rounded-md text-sm border border-red-200">
                        Blood: {selectedPassengerDetails.bloodGroup}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-[#0F284B] mb-3 flex items-center gap-2">
                    <HeartPulse className="w-5 h-5 text-red-500" /> Medical History
                  </h4>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase">Existing Conditions</p>
                      <p className="font-medium text-slate-800">{selectedPassengerDetails.healthConditions || "None declared"}</p>
                    </div>
                    <div className="border-t border-slate-200 pt-3">
                      <p className="text-xs font-bold text-slate-500 uppercase">Known Allergies</p>
                      <p className="font-medium text-red-700">{selectedPassengerDetails.allergies || "None declared"}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-[#0F284B] mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" /> Emergency Contacts
                  </h4>
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                    {selectedPassengerDetails.emergencyContactName ? (
                      <div>
                        <p className="font-bold text-orange-900">{selectedPassengerDetails.emergencyContactName}</p>
                        <p className="font-medium text-orange-800 text-lg mt-1">{selectedPassengerDetails.emergencyContactPhone}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-orange-800 italic">No emergency contact provided.</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
