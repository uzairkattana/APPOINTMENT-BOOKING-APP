"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Plus, TrendingDown, TrendingUp, Activity, Calendar } from "lucide-react"
import type { Patient } from "@/lib/dashboard-types"

interface SymptomTrackerProps {
  patient: Patient | null
}

export function SymptomTracker({ patient }: SymptomTrackerProps) {
  const [painLevel, setPainLevel] = useState([4])
  const [functionalRating, setFunctionalRating] = useState([7])
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [newSymptom, setNewSymptom] = useState("")
  const [notes, setNotes] = useState("")

  // Mock symptom tracking data
  const symptomHistory = [
    { date: "2024-06-01", pain: 8, function: 3, stiffness: 7, mobility: 4 },
    { date: "2024-06-03", pain: 7, function: 4, stiffness: 6, mobility: 5 },
    { date: "2024-06-05", pain: 6, function: 5, stiffness: 5, mobility: 6 },
    { date: "2024-06-07", pain: 5, function: 6, stiffness: 4, mobility: 7 },
    { date: "2024-06-09", pain: 4, function: 7, stiffness: 3, mobility: 8 },
    { date: "2024-06-11", pain: 3, function: 8, stiffness: 2, mobility: 9 },
  ]

  const commonSymptoms = [
    "Lower back pain",
    "Neck stiffness",
    "Muscle spasm",
    "Radiating pain",
    "Morning stiffness",
    "Headache",
    "Shoulder tension",
    "Hip discomfort",
    "Leg numbness",
    "Tingling sensation",
  ]

  const bodyAreas = [
    { name: "Neck", x: 50, y: 15 },
    { name: "Upper Back", x: 50, y: 25 },
    { name: "Lower Back", x: 50, y: 40 },
    { name: "Left Shoulder", x: 30, y: 20 },
    { name: "Right Shoulder", x: 70, y: 20 },
    { name: "Left Hip", x: 40, y: 50 },
    { name: "Right Hip", x: 60, y: 50 },
  ]

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) => (prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]))
  }

  const addCustomSymptom = () => {
    if (newSymptom.trim() && !selectedSymptoms.includes(newSymptom.trim())) {
      setSelectedSymptoms((prev) => [...prev, newSymptom.trim()])
      setNewSymptom("")
    }
  }

  const handleSubmit = () => {
    // Here you would submit the symptom data
    console.log({
      painLevel: painLevel[0],
      functionalRating: functionalRating[0],
      symptoms: selectedSymptoms,
      notes,
      date: new Date().toISOString(),
    })

    // Reset form
    setPainLevel([4])
    setFunctionalRating([7])
    setSelectedSymptoms([])
    setNotes("")
  }

  return (
    <div className="space-y-6">
      {/* Symptom Progress Chart */}
      <Card className="border-[#0d5c75]/20 bg-white shadow-lg">
        <CardHeader className="bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] text-white">
          <CardTitle className="font-poppins">Symptom Progress Tracking</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={symptomHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                stroke="#0A3A47"
                fontSize={12}
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                }
              />
              <YAxis stroke="#0A3A47" fontSize={12} domain={[0, 10]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#F8F5F0",
                  border: "1px solid #0d5c75",
                  borderRadius: "8px",
                }}
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <Line
                type="monotone"
                dataKey="pain"
                stroke="#f3a800"
                strokeWidth={3}
                dot={{ fill: "#f3a800", strokeWidth: 2, r: 4 }}
                name="Pain Level"
              />
              <Line
                type="monotone"
                dataKey="function"
                stroke="#2a9d8f"
                strokeWidth={3}
                dot={{ fill: "#2a9d8f", strokeWidth: 2, r: 4 }}
                name="Function Score"
              />
              <Line
                type="monotone"
                dataKey="stiffness"
                stroke="#0d5c75"
                strokeWidth={2}
                dot={{ fill: "#0d5c75", strokeWidth: 2, r: 3 }}
                name="Stiffness"
              />
              <Line
                type="monotone"
                dataKey="mobility"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: "#10b981", strokeWidth: 2, r: 3 }}
                name="Mobility"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Symptom Log */}
        <Card className="border-[#0d5c75]/20 bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#0d5c75] font-poppins">Daily Symptom Log</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Pain Level */}
            <div>
              <Label className="text-[#0A3A47] font-semibold font-poppins">Current Pain Level</Label>
              <div className="mt-2">
                <Slider value={painLevel} onValueChange={setPainLevel} max={10} min={0} step={1} className="w-full" />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>No Pain</span>
                  <span className="font-semibold text-[#0A3A47]">{painLevel[0]}/10</span>
                  <span>Worst Pain</span>
                </div>
              </div>
            </div>

            {/* Functional Rating */}
            <div>
              <Label className="text-[#0A3A47] font-semibold font-poppins">Functional Rating</Label>
              <div className="mt-2">
                <Slider
                  value={functionalRating}
                  onValueChange={setFunctionalRating}
                  max={10}
                  min={0}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Can't Function</span>
                  <span className="font-semibold text-[#0A3A47]">{functionalRating[0]}/10</span>
                  <span>Normal Function</span>
                </div>
              </div>
            </div>

            {/* Symptom Selection */}
            <div>
              <Label className="text-[#0A3A47] font-semibold font-poppins">Current Symptoms</Label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {commonSymptoms.map((symptom) => (
                  <Button
                    key={symptom}
                    variant={selectedSymptoms.includes(symptom) ? "default" : "outline"}
                    size="sm"
                    className={`text-xs justify-start ${
                      selectedSymptoms.includes(symptom)
                        ? "bg-[#2a9d8f] hover:bg-[#238a7a] text-white"
                        : "border-[#0d5c75]/30 text-[#0A3A47] hover:bg-[#F8F5F0]"
                    }`}
                    onClick={() => toggleSymptom(symptom)}
                  >
                    {symptom}
                  </Button>
                ))}
              </div>
            </div>

            {/* Add Custom Symptom */}
            <div>
              <Label className="text-[#0A3A47] font-semibold font-poppins">Add Custom Symptom</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={newSymptom}
                  onChange={(e) => setNewSymptom(e.target.value)}
                  placeholder="Describe your symptom..."
                  className="border-[#0d5c75]/30 focus:border-[#2a9d8f]"
                />
                <Button onClick={addCustomSymptom} className="bg-[#2a9d8f] hover:bg-[#238a7a] text-white">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label className="text-[#0A3A47] font-semibold font-poppins">Additional Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional details about your symptoms, activities, or observations..."
                className="mt-2 border-[#0d5c75]/30 focus:border-[#2a9d8f]"
                rows={3}
              />
            </div>

            <Button onClick={handleSubmit} className="w-full bg-[#2a9d8f] hover:bg-[#238a7a] text-white">
              <Activity className="h-4 w-4 mr-2" />
              Log Today's Symptoms
            </Button>
          </CardContent>
        </Card>

        {/* Body Map & Recent Trends */}
        <div className="space-y-6">
          {/* Body Map */}
          <Card className="border-[#0d5c75]/20 bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-[#0d5c75] font-poppins">Pain Location Map</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative bg-[#F8F5F0] rounded-lg p-6 h-80">
                {/* Simple body outline */}
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {/* Head */}
                  <circle cx="50" cy="10" r="8" fill="none" stroke="#0d5c75" strokeWidth="1" />

                  {/* Torso */}
                  <rect x="40" y="18" width="20" height="35" rx="3" fill="none" stroke="#0d5c75" strokeWidth="1" />

                  {/* Arms */}
                  <line x1="40" y1="25" x2="25" y2="35" stroke="#0d5c75" strokeWidth="1" />
                  <line x1="60" y1="25" x2="75" y2="35" stroke="#0d5c75" strokeWidth="1" />

                  {/* Legs */}
                  <line x1="45" y1="53" x2="45" y2="85" stroke="#0d5c75" strokeWidth="1" />
                  <line x1="55" y1="53" x2="55" y2="85" stroke="#0d5c75" strokeWidth="1" />

                  {/* Pain points */}
                  {bodyAreas.map((area, index) => (
                    <g key={area.name}>
                      <circle
                        cx={area.x}
                        cy={area.y}
                        r="3"
                        fill={
                          selectedSymptoms.some((s) => s.toLowerCase().includes(area.name.toLowerCase()))
                            ? "#f3a800"
                            : "#e5e7eb"
                        }
                        className="cursor-pointer hover:fill-[#f3a800] transition-colors"
                        onClick={() => {
                          const symptom = `${area.name} pain`
                          toggleSymptom(symptom)
                        }}
                      />
                      <text
                        x={area.x}
                        y={area.y - 6}
                        textAnchor="middle"
                        fontSize="3"
                        fill="#0A3A47"
                        className="pointer-events-none"
                      >
                        {area.name}
                      </text>
                    </g>
                  ))}
                </svg>

                <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                  Click on body areas to mark pain locations
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Trends */}
          <Card className="border-[#0d5c75]/20 bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-[#0d5c75] font-poppins">Recent Trends</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <TrendingDown className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-800 font-poppins">Pain Decreasing</p>
                      <p className="text-sm text-green-600 font-open-sans">Down 50% from initial visit</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-green-600 font-poppins">-50%</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-semibold text-blue-800 font-poppins">Function Improving</p>
                      <p className="text-sm text-blue-600 font-open-sans">Up 167% from initial visit</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-blue-600 font-poppins">+167%</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#F8F5F0] rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-[#0d5c75]" />
                    <div>
                      <p className="font-semibold text-[#0A3A47] font-poppins">Consistency</p>
                      <p className="text-sm text-gray-600 font-open-sans">Logged 6 days this week</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-[#0d5c75] font-poppins">6/7</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
