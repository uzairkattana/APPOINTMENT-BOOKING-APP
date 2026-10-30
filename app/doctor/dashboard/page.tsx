"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  Users,
  Activity,
  TrendingUp,
  Search,
  Filter,
  Clock,
  AlertTriangle,
  FileText,
  Stethoscope,
  Eye,
  Edit,
  Plus,
} from "lucide-react"
import { AdjustmentAtlas } from "@/components/dashboard/adjustment-atlas"
import { TreatmentTracker } from "@/components/dashboard/treatment-tracker"
import type { Patient, Appointment, DashboardStats } from "@/lib/dashboard-types"

export default function DoctorDashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalPatients: 247,
    todayAppointments: 12,
    weeklyTreatments: 68,
    averageImprovement: 87,
    upcomingReEvals: 8,
    overduePatients: 3,
  })

  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([
    {
      id: "1",
      patientId: "p1",
      doctorId: "dr1",
      date: "2024-06-10",
      time: "09:00",
      duration: 30,
      type: "initial",
      status: "scheduled",
      chiefComplaint: "Lower back pain, 3 weeks duration",
      preVisitForms: {
        painScale: 7,
        functionalRating: 4,
        symptoms: ["lower back pain", "stiffness", "muscle spasm"],
        newSymptoms: ["radiating pain to left leg"],
      },
    },
    {
      id: "2",
      patientId: "p2",
      doctorId: "dr1",
      date: "2024-06-10",
      time: "09:30",
      duration: 20,
      type: "follow-up",
      status: "confirmed",
      chiefComplaint: "Neck pain follow-up",
      preVisitForms: {
        painScale: 3,
        functionalRating: 7,
        symptoms: ["mild neck stiffness"],
        newSymptoms: [],
      },
    },
    {
      id: "3",
      patientId: "p3",
      doctorId: "dr1",
      date: "2024-06-10",
      time: "10:00",
      duration: 45,
      type: "reeval",
      status: "scheduled",
      chiefComplaint: "6-week re-evaluation",
      preVisitForms: {
        painScale: 2,
        functionalRating: 8,
        symptoms: ["occasional stiffness"],
        newSymptoms: [],
      },
    },
  ])

  const getAppointmentTypeColor = (type: string) => {
    switch (type) {
      case "initial":
        return "bg-blue-500"
      case "follow-up":
        return "bg-[#2a9d8f]"
      case "reeval":
        return "bg-[rgb(227,252,236)]"
      case "emergency":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "text-green-600"
      case "scheduled":
        return "text-blue-600"
      case "in-progress":
        return "text-[rgb(227,252,236)]"
      case "completed":
        return "text-gray-600"
      default:
        return "text-gray-500"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F5F0] to-[#FEFCF8] p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#0d5c75] font-poppins">Dr. Bashir's Dashboard</h1>
            <p className="text-[#0A3A47] font-open-sans">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button className="bg-[#2a9d8f] hover:bg-[#238a7a] text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Patient
            </Button>
            <Button variant="outline" className="border-[#0d5c75] text-[#0d5c75]">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <Card className="border-[#0d5c75]/20 bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#0A3A47] font-open-sans">Today's Appointments</p>
                <p className="text-2xl font-bold text-[#0d5c75] font-poppins">{dashboardStats.todayAppointments}</p>
              </div>
              <Calendar className="h-8 w-8 text-[#2a9d8f]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#0d5c75]/20 bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#0A3A47] font-open-sans">Total Patients</p>
                <p className="text-2xl font-bold text-[#0d5c75] font-poppins">{dashboardStats.totalPatients}</p>
              </div>
              <Users className="h-8 w-8 text-[#2a9d8f]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#0d5c75]/20 bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#0A3A47] font-open-sans">Weekly Treatments</p>
                <p className="text-2xl font-bold text-[#0d5c75] font-poppins">{dashboardStats.weeklyTreatments}</p>
              </div>
              <Activity className="h-8 w-8 text-[#2a9d8f]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#0d5c75]/20 bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#0A3A47] font-open-sans">Avg Improvement</p>
                <p className="text-2xl font-bold text-[#0d5c75] font-poppins">{dashboardStats.averageImprovement}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-[#2a9d8f]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#0d5c75]/20 bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#0A3A47] font-open-sans">Upcoming Re-evals</p>
                <p className="text-2xl font-bold" style={{ color: 'rgb(227,252,236)' }}>{dashboardStats.upcomingReEvals}</p>
              </div>
              <FileText className="h-8 w-8" style={{ color: 'rgb(227,252,236)' }} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 font-open-sans">Overdue Patients</p>
                <p className="text-2xl font-bold text-red-600 font-poppins">{dashboardStats.overduePatients}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Appointment Timeline */}
        <div className="lg:col-span-1">
          <Card className="border-[#0d5c75]/20 bg-white shadow-lg h-fit">
            <CardHeader className="bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] text-white">
              <CardTitle className="flex items-center gap-2 font-poppins">
                <Clock className="h-5 w-5" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[600px] overflow-y-auto">
                {todayAppointments.map((appointment, index) => (
                  <div
                    key={appointment.id}
                    className="p-4 border-b border-gray-100 hover:bg-[#F8F5F0] transition-colors cursor-pointer"
                    onClick={() => setSelectedPatient(null)} // Would load actual patient data
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-3 h-3 rounded-full ${getAppointmentTypeColor(appointment.type)} mt-2`}></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-[#0A3A47] font-poppins">{appointment.time}</span>
                          <Badge
                            variant="outline"
                            className={`text-xs ${appointment.type === "initial" ? "border-blue-500 text-blue-600" : appointment.type === "reeval" ? "" : "border-[#2a9d8f] text-[#2a9d8f]"}`}
                            style={appointment.type === "reeval" ? { borderColor: 'rgb(227,252,236)', color: 'rgb(227,252,236)' } : {}}
                          >
                            {appointment.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-[#0A3A47] font-open-sans mb-1">Patient #{appointment.patientId}</p>
                        <p className="text-xs text-gray-600 font-open-sans">{appointment.chiefComplaint}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500">Pain:</span>
                          <div className="flex gap-1">
                            {[...Array(10)].map((_, i) => (
                              <div
                                key={i}
                                className={`w-2 h-2 rounded-full ${i < appointment.preVisitForms.painScale ? "bg-red-500" : "bg-gray-200"}`}
                              ></div>
                            ))}
                          </div>
                          <span className="text-xs font-semibold text-[#0A3A47]">
                            {appointment.preVisitForms.painScale}/10
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className={`text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Patient Management & Tools */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4 bg-white border border-[#0d5c75]/20">
              <TabsTrigger value="overview" className="data-[state=active]:bg-[#2a9d8f] data-[state=active]:text-white">
                Overview
              </TabsTrigger>
              <TabsTrigger value="patients" className="data-[state=active]:bg-[#2a9d8f] data-[state=active]:text-white">
                Patients
              </TabsTrigger>
              <TabsTrigger value="atlas" className="data-[state=active]:bg-[#2a9d8f] data-[state=active]:text-white">
                Atlas
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="data-[state=active]:bg-[#2a9d8f] data-[state=active]:text-white"
              >
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* Quick Actions */}
              <Card className="border-[#0d5c75]/20 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-[#0d5c75] font-poppins">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button className="bg-[#2a9d8f] hover:bg-[#238a7a] text-white h-20 flex-col gap-2">
                      <Stethoscope className="h-6 w-6" />
                      <span className="text-xs">Start Treatment</span>
                    </Button>
                    <Button variant="outline" className="border-[#0d5c75] text-[#0d5c75] h-20 flex-col gap-2">
                      <FileText className="h-6 w-6" />
                      <span className="text-xs">Progress Notes</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2" style={{ borderColor: 'rgb(227,252,236)', color: 'rgb(227,252,236)' }}>
                      <Calendar className="h-6 w-6" />
                      <span className="text-xs">Schedule</span>
                    </Button>
                    <Button variant="outline" className="border-[#0d5c75] text-[#0d5c75] h-20 flex-col gap-2">
                      <Users className="h-6 w-6" />
                      <span className="text-xs">Patient Search</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="border-[#0d5c75]/20 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-[#0d5c75] font-poppins">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {
                        time: "10 minutes ago",
                        action: "Completed treatment for Patient #247",
                        type: "treatment",
                      },
                      {
                        time: "25 minutes ago",
                        action: "Updated progress notes for Patient #245",
                        type: "notes",
                      },
                      {
                        time: "1 hour ago",
                        action: "Scheduled follow-up for Patient #243",
                        type: "schedule",
                      },
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-[#F8F5F0] rounded-lg">
                        <div
                          className={`w-2 h-2 rounded-full ${activity.type === "treatment" ? "bg-[#2a9d8f]" : activity.type === "notes" ? "" : "bg-[#0d5c75]"}`}
                          style={activity.type === "notes" ? { backgroundColor: 'rgb(227,252,236)' } : {}}
                        ></div>
                        <div className="flex-1">
                          <p className="text-sm text-[#0A3A47] font-open-sans">{activity.action}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="patients" className="space-y-4">
              {/* Patient Search */}
              <Card className="border-[#0d5c75]/20 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-[#0d5c75] font-poppins">Patient Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3 mb-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search patients by name, ID, or condition..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-[#0d5c75]/30 focus:border-[#2a9d8f]"
                      />
                    </div>
                    <Button variant="outline" className="border-[#0d5c75] text-[#0d5c75]">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>

                  {/* Patient List */}
                  <div className="space-y-3">
                    {[
                      {
                        id: "P001",
                        name: "Sarah Johnson",
                        lastVisit: "2024-06-08",
                        condition: "Lower back pain",
                        progress: 85,
                        riskFlags: ["overdue"],
                      },
                      {
                        id: "P002",
                        name: "Michael Chen",
                        lastVisit: "2024-06-09",
                        condition: "Cervical misalignment",
                        progress: 92,
                        riskFlags: [],
                      },
                      {
                        id: "P003",
                        name: "Emma Rodriguez",
                        lastVisit: "2024-06-07",
                        condition: "Sports injury recovery",
                        progress: 78,
                        riskFlags: ["high-risk"],
                      },
                    ].map((patient) => (
                      <div
                        key={patient.id}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-[#F8F5F0] transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {patient.name.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-semibold text-[#0A3A47] font-poppins">{patient.name}</h4>
                              <p className="text-sm text-gray-600 font-open-sans">ID: {patient.id}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {patient.riskFlags.map((flag) => (
                              <Badge
                                key={flag}
                                variant="outline"
                                className={`text-xs ${flag === "overdue" ? "border-red-500 text-red-600" : ""}`}
                                style={flag !== "overdue" ? { borderColor: 'rgb(227,252,236)', color: 'rgb(227,252,236)' } : {}}
                              >
                                {flag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Last Visit:</span>
                            <span className="ml-2 text-[#0A3A47]">{patient.lastVisit}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Condition:</span>
                            <span className="ml-2 text-[#0A3A47]">{patient.condition}</span>
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-500">Progress</span>
                            <span className="text-[#0A3A47] font-semibold">{patient.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-[#2a9d8f] to-[#0d5c75] h-2 rounded-full transition-all duration-300"
                              style={{ width: `${patient.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="atlas" className="space-y-4">
              <AdjustmentAtlas />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <TreatmentTracker />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
