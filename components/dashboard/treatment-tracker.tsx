"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp } from "lucide-react"

export function TreatmentTracker() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("week")

  // Sample data for charts
  const painProgressData = [
    { date: "Week 1", pain: 8, function: 3 },
    { date: "Week 2", pain: 7, function: 4 },
    { date: "Week 3", pain: 5, function: 6 },
    { date: "Week 4", pain: 4, function: 7 },
    { date: "Week 5", pain: 3, function: 8 },
    { date: "Week 6", pain: 2, function: 9 },
  ]

  const treatmentTypesData = [
    { name: "Gonstead Adjustments", value: 65, color: "#2a9d8f" },
    { name: "Soft Tissue Work", value: 20, color: "rgb(227,252,236)" },
    { name: "Exercise Therapy", value: 10, color: "#0d5c75" },
    { name: "Patient Education", value: 5, color: "#6366f1" },
  ]

  const weeklyTreatmentsData = [
    { week: "Week 1", treatments: 12 },
    { week: "Week 2", treatments: 15 },
    { week: "Week 3", treatments: 18 },
    { week: "Week 4", treatments: 16 },
    { week: "Week 5", treatments: 20 },
    { week: "Week 6", treatments: 22 },
  ]

  const outcomeMetrics = [
    { metric: "Pain Reduction", current: 87, target: 85, trend: "up" },
    { metric: "Functional Improvement", current: 92, target: 90, trend: "up" },
    { metric: "Patient Satisfaction", current: 96, target: 95, trend: "up" },
    { metric: "Treatment Compliance", current: 89, target: 90, trend: "down" },
  ]

  return (
    <div className="space-y-6">
      {/* Outcome Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {outcomeMetrics.map((metric, index) => (
          <Card key={index} className="border-[#0d5c75]/20 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-[#0A3A47] font-open-sans">{metric.metric}</h3>
                <TrendingUp className={`h-4 w-4 ${metric.trend === "up" ? "text-green-500" : "text-red-500"}`} />
              </div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-[#0d5c75] font-poppins">{metric.current}%</span>
                <span className="text-sm text-gray-500">/ {metric.target}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-gradient-to-r from-[#2a9d8f] to-[#0d5c75] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(metric.current / metric.target) * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pain & Function Progress */}
        <Card className="border-[#0d5c75]/20 bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#0d5c75] font-poppins">Pain & Function Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={painProgressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#0A3A47" fontSize={12} />
                <YAxis stroke="#0A3A47" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#F8F5F0",
                    border: "1px solid #0d5c75",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="pain"
                  stroke="rgb(227,252,236)"
                  strokeWidth={3}
                  dot={{ fill: "rgb(227,252,236)", strokeWidth: 2, r: 4 }}
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
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Treatment Types Distribution */}
        <Card className="border-[#0d5c75]/20 bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#0d5c75] font-poppins">Treatment Types Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={treatmentTypesData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  labelLine={false}
                >
                  {treatmentTypesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#F8F5F0",
                    border: "1px solid #0d5c75",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Treatments Volume */}
        <Card className="border-[#0d5c75]/20 bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#0d5c75] font-poppins">Weekly Treatment Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyTreatmentsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" stroke="#0A3A47" fontSize={12} />
                <YAxis stroke="#0A3A47" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#F8F5F0",
                    border: "1px solid #0d5c75",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="treatments" fill="url(#colorGradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2a9d8f" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#0d5c75" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* ROM Measurements */}
        <Card className="border-[#0d5c75]/20 bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#0d5c75] font-poppins">Range of Motion Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { movement: "Cervical Flexion", current: 45, normal: 50, improvement: 15 },
                { movement: "Cervical Extension", current: 60, normal: 65, improvement: 20 },
                { movement: "Lumbar Flexion", current: 80, normal: 90, improvement: 25 },
                { movement: "Lumbar Extension", current: 25, normal: 30, improvement: 10 },
              ].map((rom, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-[#0A3A47] font-open-sans">{rom.movement}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#0A3A47]">{rom.current}°</span>
                      <span className="text-xs text-gray-500">/ {rom.normal}°</span>
                      <span className="text-xs text-green-600 font-semibold">+{rom.improvement}°</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="relative h-3 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#2a9d8f] to-[#0d5c75] h-3 rounded-full transition-all duration-500"
                        style={{ width: `${(rom.current / rom.normal) * 100}%` }}
                      ></div>
                      <div
                        className="absolute top-0 right-0 w-1 h-3 bg-[rgb(227,252,236)]"
                        style={{ right: `${100 - (rom.normal / rom.normal) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Treatment History Table */}
      <Card className="border-[#0d5c75]/20 bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-[#0d5c75] font-poppins">Recent Treatment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-[#0A3A47] font-open-sans">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#0A3A47] font-open-sans">Patient</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#0A3A47] font-open-sans">Treatment</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#0A3A47] font-open-sans">Segments</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#0A3A47] font-open-sans">Response</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#0A3A47] font-open-sans">Next Visit</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    date: "2024-06-10",
                    patient: "Sarah Johnson",
                    treatment: "Gonstead Adjustment",
                    segments: "L2, L3, L5",
                    response: "Good",
                    nextVisit: "2024-06-12",
                  },
                  {
                    date: "2024-06-10",
                    patient: "Michael Chen",
                    treatment: "Cervical Adjustment",
                    segments: "C1, C4",
                    response: "Excellent",
                    nextVisit: "2024-06-14",
                  },
                  {
                    date: "2024-06-09",
                    patient: "Emma Rodriguez",
                    treatment: "Thoracic Adjustment",
                    segments: "T2, T3",
                    response: "Fair",
                    nextVisit: "2024-06-11",
                  },
                ].map((treatment, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-[#F8F5F0] transition-colors">
                    <td className="py-3 px-4 text-[#0A3A47] font-open-sans">{treatment.date}</td>
                    <td className="py-3 px-4 text-[#0A3A47] font-open-sans">{treatment.patient}</td>
                    <td className="py-3 px-4 text-[#0A3A47] font-open-sans">{treatment.treatment}</td>
                    <td className="py-3 px-4 text-[#0A3A47] font-open-sans">{treatment.segments}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          treatment.response === "Excellent"
                            ? "bg-green-100 text-green-800"
                            : treatment.response === "Good"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                        }`}
                      >
                        {treatment.response}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#0A3A47] font-open-sans">{treatment.nextVisit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
