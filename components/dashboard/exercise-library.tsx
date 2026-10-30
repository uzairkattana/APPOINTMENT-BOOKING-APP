"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, CheckCircle, Clock, RotateCcw, Star, Calendar } from "lucide-react"
import type { Patient, Exercise } from "@/lib/dashboard-types"

interface ExerciseLibraryProps {
  patient: Patient | null
}

export function ExerciseLibrary({ patient }: ExerciseLibraryProps) {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [completedToday, setCompletedToday] = useState<string[]>([])

  // Mock exercise data
  const prescribedExercises: Exercise[] = [
    {
      id: "ex1",
      name: "Pelvic Tilts",
      description: "Gentle movement to improve lumbar mobility and strengthen core muscles",
      sets: 2,
      reps: 10,
      frequency: "2x daily",
      instructions:
        "Lie on your back with knees bent. Gently tilt your pelvis forward and backward, focusing on the movement in your lower back.",
      videoUrl: "/videos/pelvic-tilts.mp4",
      imageUrl: "/images/pelvic-tilts.jpg",
    },
    {
      id: "ex2",
      name: "Cat-Cow Stretch",
      description: "Spinal mobility exercise to improve flexibility and reduce stiffness",
      sets: 1,
      reps: 15,
      frequency: "3x daily",
      instructions:
        "Start on hands and knees. Arch your back (cow), then round it (cat). Move slowly and breathe deeply.",
      videoUrl: "/videos/cat-cow.mp4",
      imageUrl: "/images/cat-cow.jpg",
    },
    {
      id: "ex3",
      name: "Knee to Chest",
      description: "Gentle stretch for lower back and hip flexors",
      sets: 2,
      reps: 5,
      frequency: "2x daily",
      instructions: "Lie on your back. Bring one knee to your chest, hold for 30 seconds. Repeat with other leg.",
      videoUrl: "/videos/knee-to-chest.mp4",
      imageUrl: "/images/knee-to-chest.jpg",
    },
    {
      id: "ex4",
      name: "Wall Angels",
      description: "Posture improvement exercise for upper back and shoulders",
      sets: 3,
      reps: 12,
      frequency: "1x daily",
      instructions:
        "Stand with back against wall. Move arms up and down like making snow angels, keeping contact with wall.",
      videoUrl: "/videos/wall-angels.mp4",
      imageUrl: "/images/wall-angels.jpg",
    },
  ]

  const exerciseLibrary: Exercise[] = [
    {
      id: "lib1",
      name: "Bird Dog",
      description: "Core stability and spinal alignment exercise",
      sets: 2,
      reps: 8,
      frequency: "Daily",
      instructions: "Start on hands and knees. Extend opposite arm and leg, hold for 5 seconds.",
      videoUrl: "/videos/bird-dog.mp4",
      imageUrl: "/images/bird-dog.jpg",
    },
    {
      id: "lib2",
      name: "Dead Bug",
      description: "Core strengthening with spinal stability focus",
      sets: 2,
      reps: 10,
      frequency: "Daily",
      instructions: "Lie on back, arms up, knees bent. Lower opposite arm and leg slowly.",
      videoUrl: "/videos/dead-bug.mp4",
      imageUrl: "/images/dead-bug.jpg",
    },
    {
      id: "lib3",
      name: "Thoracic Extension",
      description: "Upper back mobility and posture improvement",
      sets: 2,
      reps: 10,
      frequency: "2x daily",
      instructions: "Sit in chair, hands behind head. Gently extend upper back over chair.",
      videoUrl: "/videos/thoracic-extension.mp4",
      imageUrl: "/images/thoracic-extension.jpg",
    },
  ]

  const markComplete = (exerciseId: string) => {
    setCompletedToday((prev) =>
      prev.includes(exerciseId) ? prev.filter((id) => id !== exerciseId) : [...prev, exerciseId],
    )
  }

  const todayProgress = (completedToday.length / prescribedExercises.length) * 100

  return (
    <div className="space-y-6">
      {/* Daily Progress */}
      <Card className="border-[#0d5c75]/20 bg-white shadow-lg">
        <CardHeader className="bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] text-white">
          <CardTitle className="font-poppins">Today's Exercise Progress</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-2xl font-bold text-[#0d5c75] font-poppins">
                {completedToday.length}/{prescribedExercises.length}
              </p>
              <p className="text-sm text-gray-600 font-open-sans">Exercises completed today</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-[#2a9d8f] font-poppins">{Math.round(todayProgress)}%</p>
              <p className="text-sm text-gray-600 font-open-sans">Daily goal</p>
            </div>
          </div>
          <Progress value={todayProgress} className="h-3" />
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <span>Keep going!</span>
            <span>
              {completedToday.length === prescribedExercises.length
                ? "🎉 All done!"
                : `${prescribedExercises.length - completedToday.length} remaining`}
            </span>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="prescribed" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 bg-white border border-[#0d5c75]/20">
          <TabsTrigger value="prescribed" className="data-[state=active]:bg-[#2a9d8f] data-[state=active]:text-white">
            My Prescribed Exercises
          </TabsTrigger>
          <TabsTrigger value="library" className="data-[state=active]:bg-[#2a9d8f] data-[state=active]:text-white">
            Exercise Library
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prescribed" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prescribedExercises.map((exercise) => (
              <Card
                key={exercise.id}
                className="border-[#0d5c75]/20 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#0A3A47] font-poppins mb-2">{exercise.name}</h3>
                      <p className="text-sm text-gray-600 font-open-sans mb-3">{exercise.description}</p>

                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <span className="flex items-center gap-1">
                          <RotateCcw className="h-4 w-4" />
                          {exercise.sets} sets
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4" />
                          {exercise.reps} reps
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {exercise.frequency}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant={completedToday.includes(exercise.id) ? "default" : "outline"}
                      size="sm"
                      className={
                        completedToday.includes(exercise.id)
                          ? "bg-green-500 hover:bg-green-600 text-white"
                          : "border-[#0d5c75] text-[#0d5c75] hover:bg-[#F8F5F0]"
                      }
                      onClick={() => markComplete(exercise.id)}
                    >
                      {completedToday.includes(exercise.id) ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <Button
                      className="w-full bg-[#2a9d8f] hover:bg-[#238a7a] text-white"
                      onClick={() => setSelectedExercise(exercise)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Watch Demo
                    </Button>

                    <div className="text-xs text-gray-600 font-open-sans">
                      <strong>Instructions:</strong> {exercise.instructions}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="library" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exerciseLibrary.map((exercise) => (
              <Card
                key={exercise.id}
                className="border-[#0d5c75]/20 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#0A3A47] font-poppins mb-2">{exercise.name}</h3>
                      <p className="text-sm text-gray-600 font-open-sans mb-3">{exercise.description}</p>

                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <span className="flex items-center gap-1">
                          <RotateCcw className="h-4 w-4" />
                          {exercise.sets} sets
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4" />
                          {exercise.reps} reps
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {exercise.frequency}
                        </span>
                      </div>
                    </div>

                    <Badge variant="outline" className="border-[#f3a800] text-[#f3a800]">
                      Optional
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full border-[#0d5c75] text-[#0d5c75] hover:bg-[#F8F5F0]"
                      onClick={() => setSelectedExercise(exercise)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      View Exercise
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full border-[#2a9d8f] text-[#2a9d8f] hover:bg-[#2a9d8f] hover:text-white"
                    >
                      Add to My Plan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <Card className="border-[#0d5c75]/20 bg-white shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] text-white">
            <CardTitle className="font-poppins flex items-center justify-between">
              {selectedExercise.name}
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={() => setSelectedExercise(null)}
              >
                ✕
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Video/Image Placeholder */}
              <div className="bg-[#F8F5F0] rounded-lg p-8 flex items-center justify-center min-h-[300px]">
                <div className="text-center">
                  <Play className="h-16 w-16 text-[#2a9d8f] mx-auto mb-4" />
                  <p className="text-[#0A3A47] font-poppins font-semibold">Exercise Demonstration</p>
                  <p className="text-sm text-gray-600 font-open-sans">Video tutorial coming soon</p>
                </div>
              </div>

              {/* Exercise Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-[#0A3A47] font-poppins mb-2">Description</h3>
                  <p className="text-gray-600 font-open-sans">{selectedExercise.description}</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-[#F8F5F0] rounded-lg">
                    <p className="text-2xl font-bold text-[#0d5c75] font-poppins">{selectedExercise.sets}</p>
                    <p className="text-sm text-gray-600 font-open-sans">Sets</p>
                  </div>
                  <div className="text-center p-3 bg-[#F8F5F0] rounded-lg">
                    <p className="text-2xl font-bold text-[#2a9d8f] font-poppins">{selectedExercise.reps}</p>
                    <p className="text-sm text-gray-600 font-open-sans">Reps</p>
                  </div>
                  <div className="text-center p-3 bg-[#F8F5F0] rounded-lg">
                    <p className="text-lg font-bold text-[#f3a800] font-poppins">{selectedExercise.frequency}</p>
                    <p className="text-sm text-gray-600 font-open-sans">Frequency</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-[#0A3A47] font-poppins mb-2">Instructions</h3>
                  <p className="text-gray-600 font-open-sans">{selectedExercise.instructions}</p>
                </div>

                <div className="flex gap-3">
                  <Button
                    className="flex-1 bg-[#2a9d8f] hover:bg-[#238a7a] text-white"
                    onClick={() => markComplete(selectedExercise.id)}
                  >
                    {completedToday.includes(selectedExercise.id) ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Completed
                      </>
                    ) : (
                      <>
                        <Clock className="h-4 w-4 mr-2" />
                        Mark Complete
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="border-[#0d5c75] text-[#0d5c75]"
                    onClick={() => setSelectedExercise(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
