"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, TrendingUp, AlertCircle, CheckCircle } from "lucide-react"

interface SpinalSegment {
  id: string
  name: string
  level: string
  status: "normal" | "restricted" | "hypermobile" | "fixated"
  lastAdjusted?: string
  adjustmentCount: number
  painLevel: number
  notes: string
}

export function AdjustmentAtlas() {
  const [selectedSegment, setSelectedSegment] = useState<SpinalSegment | null>(null)
  const [viewMode, setViewMode] = useState<"lateral" | "posterior" | "anterior">("posterior")

  const spinalSegments: SpinalSegment[] = [
    // Cervical
    {
      id: "C1",
      name: "Atlas",
      level: "C1",
      status: "restricted",
      lastAdjusted: "2024-06-08",
      adjustmentCount: 3,
      painLevel: 2,
      notes: "Responds well to Gonstead technique",
    },
    { id: "C2", name: "Axis", level: "C2", status: "normal", adjustmentCount: 1, painLevel: 0, notes: "Stable" },
    { id: "C3", name: "C3", level: "C3", status: "normal", adjustmentCount: 0, painLevel: 0, notes: "" },
    {
      id: "C4",
      name: "C4",
      level: "C4",
      status: "restricted",
      lastAdjusted: "2024-06-09",
      adjustmentCount: 2,
      painLevel: 3,
      notes: "Monitor for improvement",
    },
    { id: "C5", name: "C5", level: "C5", status: "normal", adjustmentCount: 0, painLevel: 0, notes: "" },
    { id: "C6", name: "C6", level: "C6", status: "normal", adjustmentCount: 1, painLevel: 1, notes: "" },
    {
      id: "C7",
      name: "C7",
      level: "C7",
      status: "hypermobile",
      adjustmentCount: 0,
      painLevel: 1,
      notes: "Avoid manipulation",
    },

    // Thoracic (sample)
    { id: "T1", name: "T1", level: "T1", status: "normal", adjustmentCount: 0, painLevel: 0, notes: "" },
    {
      id: "T2",
      name: "T2",
      level: "T2",
      status: "restricted",
      lastAdjusted: "2024-06-07",
      adjustmentCount: 4,
      painLevel: 4,
      notes: "Primary complaint area",
    },
    { id: "T3", name: "T3", level: "T3", status: "normal", adjustmentCount: 1, painLevel: 0, notes: "" },

    // Lumbar (sample)
    { id: "L1", name: "L1", level: "L1", status: "normal", adjustmentCount: 0, painLevel: 0, notes: "" },
    {
      id: "L2",
      name: "L2",
      level: "L2",
      status: "restricted",
      lastAdjusted: "2024-06-09",
      adjustmentCount: 5,
      painLevel: 6,
      notes: "Chief complaint - monitor closely",
    },
    {
      id: "L3",
      name: "L3",
      level: "L3",
      status: "fixated",
      lastAdjusted: "2024-06-08",
      adjustmentCount: 3,
      painLevel: 5,
      notes: "Requires gentle approach",
    },
    { id: "L4", name: "L4", level: "L4", status: "normal", adjustmentCount: 1, painLevel: 1, notes: "" },
    {
      id: "L5",
      name: "L5",
      level: "L5",
      status: "restricted",
      lastAdjusted: "2024-06-09",
      adjustmentCount: 4,
      painLevel: 7,
      notes: "Primary focus area",
    },
  ]

  const getSegmentColor = (status: string) => {
    switch (status) {
      case "normal":
        return "bg-green-500"
      case "restricted":
        return "bg-[#f3a800]"
      case "hypermobile":
        return "bg-blue-500"
      case "fixated":
        return "bg-red-500"
      default:
        return "bg-gray-400"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "normal":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "restricted":
        return <AlertCircle className="h-4 w-4 text-[#f3a800]" />
      case "hypermobile":
        return <TrendingUp className="h-4 w-4 text-blue-500" />
      case "fixated":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  return (
    <Card className="border-[#0d5c75]/20 bg-white shadow-lg">
      <CardHeader className="bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] text-white">
        <CardTitle className="font-poppins">Adjustment Atlas - Interactive Spinal Map</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Spinal Visualization */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="posterior">Posterior</TabsTrigger>
                  <TabsTrigger value="lateral">Lateral</TabsTrigger>
                  <TabsTrigger value="anterior">Anterior</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Spine Visualization */}
            <div className="relative bg-[#F8F5F0] rounded-lg p-6 min-h-[500px]">
              <div className="flex justify-center">
                <div className="relative">
                  {/* Cervical Spine */}
                  <div className="mb-8">
                    <h3 className="text-sm font-semibold text-[#0A3A47] mb-3 text-center">Cervical</h3>
                    <div className="flex flex-col items-center gap-1">
                      {spinalSegments
                        .filter((s) => s.level.startsWith("C"))
                        .map((segment) => (
                          <div
                            key={segment.id}
                            className={`w-8 h-6 rounded-full cursor-pointer transition-all duration-200 hover:scale-110 ${getSegmentColor(segment.status)} ${selectedSegment?.id === segment.id ? "ring-4 ring-[#0d5c75] ring-opacity-50" : ""}`}
                            onClick={() => setSelectedSegment(segment)}
                            title={`${segment.level} - ${segment.status}`}
                          >
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-xs font-bold text-white">{segment.level}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Thoracic Spine */}
                  <div className="mb-8">
                    <h3 className="text-sm font-semibold text-[#0A3A47] mb-3 text-center">Thoracic</h3>
                    <div className="flex flex-col items-center gap-1">
                      {spinalSegments
                        .filter((s) => s.level.startsWith("T"))
                        .map((segment) => (
                          <div
                            key={segment.id}
                            className={`w-10 h-6 rounded-full cursor-pointer transition-all duration-200 hover:scale-110 ${getSegmentColor(segment.status)} ${selectedSegment?.id === segment.id ? "ring-4 ring-[#0d5c75] ring-opacity-50" : ""}`}
                            onClick={() => setSelectedSegment(segment)}
                            title={`${segment.level} - ${segment.status}`}
                          >
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-xs font-bold text-white">{segment.level}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Lumbar Spine */}
                  <div className="mb-8">
                    <h3 className="text-sm font-semibold text-[#0A3A47] mb-3 text-center">Lumbar</h3>
                    <div className="flex flex-col items-center gap-1">
                      {spinalSegments
                        .filter((s) => s.level.startsWith("L"))
                        .map((segment) => (
                          <div
                            key={segment.id}
                            className={`w-12 h-8 rounded-full cursor-pointer transition-all duration-200 hover:scale-110 ${getSegmentColor(segment.status)} ${selectedSegment?.id === segment.id ? "ring-4 ring-[#0d5c75] ring-opacity-50" : ""}`}
                            onClick={() => setSelectedSegment(segment)}
                            title={`${segment.level} - ${segment.status}`}
                          >
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-xs font-bold text-white">{segment.level}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-sm border">
                <h4 className="text-sm font-semibold text-[#0A3A47] mb-2">Status Legend</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-xs text-[#0A3A47]">Normal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#f3a800]"></div>
                    <span className="text-xs text-[#0A3A47]">Restricted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-xs text-[#0A3A47]">Hypermobile</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-xs text-[#0A3A47]">Fixated</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Segment Details */}
          <div className="lg:col-span-1">
            {selectedSegment ? (
              <Card className="border-[#0d5c75]/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#0d5c75] font-poppins">
                    {getStatusIcon(selectedSegment.status)}
                    {selectedSegment.name} ({selectedSegment.level})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-[#0A3A47]">Status</label>
                    <Badge
                      className={`ml-2 ${selectedSegment.status === "normal" ? "bg-green-500" : selectedSegment.status === "restricted" ? "bg-[#f3a800]" : selectedSegment.status === "hypermobile" ? "bg-blue-500" : "bg-red-500"} text-white`}
                    >
                      {selectedSegment.status}
                    </Badge>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-[#0A3A47]">Pain Level</label>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex gap-1">
                        {[...Array(10)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-3 h-3 rounded-full ${i < selectedSegment.painLevel ? "bg-red-500" : "bg-gray-200"}`}
                          ></div>
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-[#0A3A47]">{selectedSegment.painLevel}/10</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-[#0A3A47]">Adjustment Count</label>
                    <p className="text-lg font-bold text-[#0d5c75]">{selectedSegment.adjustmentCount}</p>
                  </div>

                  {selectedSegment.lastAdjusted && (
                    <div>
                      <label className="text-sm font-semibold text-[#0A3A47]">Last Adjusted</label>
                      <p className="text-sm text-[#0A3A47]">{selectedSegment.lastAdjusted}</p>
                    </div>
                  )}

                  {selectedSegment.notes && (
                    <div>
                      <label className="text-sm font-semibold text-[#0A3A47]">Notes</label>
                      <p className="text-sm text-[#0A3A47] bg-[#F8F5F0] p-2 rounded">{selectedSegment.notes}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Button className="w-full bg-[#2a9d8f] hover:bg-[#238a7a] text-white">Record Adjustment</Button>
                    <Button variant="outline" className="w-full border-[#0d5c75] text-[#0d5c75]">
                      View History
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-[#0d5c75]/20">
                <CardContent className="p-6 text-center">
                  <div className="text-gray-400 mb-4">
                    <Calendar className="h-12 w-12 mx-auto" />
                  </div>
                  <p className="text-[#0A3A47] font-open-sans">
                    Select a spinal segment to view details and treatment history
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
