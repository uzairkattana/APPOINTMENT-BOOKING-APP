"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import type { Patient } from "@/lib/dashboard-types"

interface SpineTimelineProps {
  patient: Patient | null
}

export function SpineTimeline({ patient }: SpineTimelineProps) {
  const [selectedVisit, setSelectedVisit] = useState<number | null>(null)

  // Mock treatment history data
  const treatmentHistory = [
    {
      date: "2024-06-08",
      session: 5,
      painBefore: 6,
      painAfter: 3,
      segmentsTreated: ["L2", "L3"],
      techniques: ["Gonstead Adjustment"],
      response: "Good improvement",
      homeInstructions: "Continue ice therapy, gentle walking",
      nextVisit: "2024-06-12",
      notes: "Patient reports significant improvement in morning stiffness",
    },
    {
      date: "2024-06-05",
      session: 4,
      painBefore: 7,
      painAfter: 4,
      segmentsTreated: ["L2", "L3", "L5"],
      techniques: ["Gonstead Adjustment", "Soft Tissue Work"],
      response: "Moderate improvement",
      homeInstructions: "Heat therapy before exercises",
      nextVisit: "2024-06-08",
      notes: "Muscle tension reduced, mobility improving",
    },
    {
      date: "2024-06-01",
      session: 3,
      painBefore: 8,
      painAfter: 6,
      segmentsTreated: ["L2", "L4"],
      techniques: ["Gonstead Adjustment"],
      response: "Fair improvement",
      homeInstructions: "Avoid prolonged sitting, gentle stretches",
      nextVisit: "2024-06-05",
      notes: "Initial adjustment response, some soreness expected",
    },
    {
      date: "2024-05-28",
      session: 2,
      painBefore: 8,
      painAfter: 7,
      segmentsTreated: ["L2", "L3", "L5"],
      techniques: ["Gonstead Adjustment"],
      response: "Minimal improvement",
      homeInstructions: "Rest, ice therapy",
      nextVisit: "2024-06-01",
      notes: "Second visit, establishing treatment pattern",
    },
    {
      date: "2024-05-25",
      session: 1,
      painBefore: 8,
      painAfter: 8,
      segmentsTreated: ["L2", "L3"],
      techniques: ["Initial Assessment", "Gentle Adjustment"],
      response: "Assessment complete",
      homeInstructions: "Monitor symptoms, avoid aggravating activities",
      nextVisit: "2024-05-28",
      notes: "Initial consultation and examination completed",
    },
  ]

  const overallProgress = patient
    ? (patient.treatmentPlan.completedSessions / patient.treatmentPlan.estimatedSessions) * 100
    : 0

  const painReduction =
    treatmentHistory.length > 0
      ? ((treatmentHistory[treatmentHistory.length - 1].painBefore - treatmentHistory[0].painAfter) /
          treatmentHistory[treatmentHistory.length - 1].painBefore) *
        100
      : 0

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card className="border-[#0d5c75]/20 bg-white shadow-lg">
        <CardHeader className="bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] text-white">
          <CardTitle className="font-poppins">Your Healing Journey</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Overall Progress */}
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="#f0f0f0" strokeWidth="8" fill="none" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="url(#progressGradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${overallProgress * 2.51} 251`}
                    className="transition-all duration-500"
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#2a9d8f" />
                      <stop offset="100%" stopColor="#0d5c75" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-[#0d5c75] font-poppins">{Math.round(overallProgress)}%</span>
                </div>
              </div>
              <h3 className="font-semibold text-[#0A3A47] font-poppins">Treatment Progress</h3>
              <p className="text-sm text-gray-600 font-open-sans">
                {patient?.treatmentPlan.completedSessions || 0} of {patient?.treatmentPlan.estimatedSessions || 0}{" "}
                sessions
              </p>
            </div>

            {/* Pain Reduction */}
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="#f0f0f0" strokeWidth="8" fill="none" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="rgb(138,176,141)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${painReduction * 2.51} 251`}
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-[rgb(138,176,141)] font-poppins">{Math.round(painReduction)}%</span>
                </div>
              </div>
              <h3 className="font-semibold text-[#0A3A47] font-poppins">Pain Reduction</h3>
              <p className="text-sm text-gray-600 font-open-sans">
                From {treatmentHistory[treatmentHistory.length - 1]?.painBefore || 0}/10 to{" "}
                {treatmentHistory[0]?.painAfter || 0}/10
              </p>
            </div>

            {/* Next Milestone */}
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-[#2a9d8f] to-[#0d5c75] rounded-full flex items-center justify-center">
                <Star className="h-12 w-12 text-white" />
              </div>
              <h3 className="font-semibold text-[#0A3A47] font-poppins">Next Milestone</h3>
              <p className="text-sm text-gray-600 font-open-sans">
                {patient?.treatmentPlan.estimatedSessions && patient?.treatmentPlan.completedSessions
                  ? `${patient.treatmentPlan.estimatedSessions - patient.treatmentPlan.completedSessions} sessions to goal`
                  : "Complete treatment plan"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Treatment Timeline */}
      <Card className="border-[#0d5c75]/20 bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-[#0d5c75] font-poppins">Treatment Timeline</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#2a9d8f] to-[#0d5c75]"></div>

            <div className="space-y-6">
              {treatmentHistory.map((visit, index) => (
                <div key={index} className="relative flex items-start gap-6">
                  {/* Timeline Dot */}
                  <div
                    className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center ${
                      index === 0
                        ? "bg-gradient-to-r from-[#2a9d8f] to-[#0d5c75]"
                        : "bg-white border-4 border-[#2a9d8f]"
                    } shadow-lg`}
                  >
                    <span className={`font-bold ${index === 0 ? "text-white" : "text-[#2a9d8f]"} font-poppins`}>
                      {visit.session}
                    </span>
                  </div>

                  {/* Visit Details */}
                  <div className="flex-1">
                    <Card
                      className={`border-[#0d5c75]/20 ${selectedVisit === index ? "ring-2 ring-[#2a9d8f] ring-opacity-50" : ""} cursor-pointer transition-all duration-200 hover:shadow-md`}
                      onClick={() => setSelectedVisit(selectedVisit === index ? null : index)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-[#0A3A47] font-poppins">Session {visit.session}</h4>
                            <p className="text-sm text-gray-600 font-open-sans">
                              {new Date(visit.date).toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                          <Badge
                            className={`${
                              visit.response.includes("Good")
                                ? "bg-green-500"
                                : visit.response.includes("Moderate")
                                  ? "bg-blue-500"
                                  : visit.response.includes("Fair")
                                    ? "bg-[rgb(138,176,141)]"
                                    : "bg-gray-500"
                            } text-white`}
                          >
                            {visit.response}
                          </Badge>
                        </div>

                        {/* Pain Levels */}
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <span className="text-xs text-gray-500 font-open-sans">Pain Before</span>
                            <div className="flex items-center gap-2">
                              <div className="flex gap-1">
                                {[...Array(10)].map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-2 h-2 rounded-full ${i < visit.painBefore ? "bg-red-500" : "bg-gray-200"}`}
                                  ></div>
                                ))}
                              </div>
                              <span className="text-sm font-semibold text-[#0A3A47] font-poppins">
                                {visit.painBefore}/10
                              </span>
                            </div>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 font-open-sans">Pain After</span>
                            <div className="flex items-center gap-2">
                              <div className="flex gap-1">
                                {[...Array(10)].map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-2 h-2 rounded-full ${i < visit.painAfter ? "bg-green-500" : "bg-gray-200"}`}
                                  ></div>
                                ))}
                              </div>
                              <span className="text-sm font-semibold text-[#0A3A47] font-poppins">
                                {visit.painAfter}/10
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Segments Treated */}
                        <div className="mb-3">
                          <span className="text-xs text-gray-500 font-open-sans">Segments Treated:</span>
                          <div className="flex gap-1 mt-1">
                            {visit.segmentsTreated.map((segment, segIndex) => (
                              <Badge
                                key={segIndex}
                                variant="outline"
                                className="border-[#2a9d8f] text-[#2a9d8f] text-xs"
                              >
                                {segment}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {selectedVisit === index && (
                          <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                            <div>
                              <span className="text-sm font-semibold text-[#0A3A47] font-poppins">
                                Techniques Used:
                              </span>
                              <p className="text-sm text-gray-600 font-open-sans">{visit.techniques.join(", ")}</p>
                            </div>
                            <div>
                              <span className="text-sm font-semibold text-[#0A3A47] font-poppins">
                                Home Instructions:
                              </span>
                              <p className="text-sm text-gray-600 font-open-sans">{visit.homeInstructions}</p>
                            </div>
                            <div>
                              <span className="text-sm font-semibold text-[#0A3A47] font-poppins">Notes:</span>
                              <p className="text-sm text-gray-600 font-open-sans">{visit.notes}</p>
                            </div>
                            {visit.nextVisit && (
                              <div>
                                <span className="text-sm font-semibold text-[#0A3A47] font-poppins">Next Visit:</span>
                                <p className="text-sm text-gray-600 font-open-sans">
                                  {new Date(visit.nextVisit).toLocaleDateString()}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
