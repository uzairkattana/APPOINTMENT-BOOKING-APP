"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Circle, Clock, TrendingUp, Activity } from 'lucide-react'

interface SessionProgressProps {
  totalSessions: number
  completedSessions: number
  sessions?: Array<{
    number: number
    completed: boolean
    date?: string
  }>
  className?: string
}

export function SessionProgress({ 
  totalSessions, 
  completedSessions,
  sessions,
  className = '' 
}: SessionProgressProps) {
  const progressPercentage = (completedSessions / totalSessions) * 100
  const remainingSessions = totalSessions - completedSessions

  // Generate session array if not provided
  const sessionList = sessions || Array.from({ length: totalSessions }, (_, i) => ({
    number: i + 1,
    completed: i < completedSessions
  }))

  return (
    <Card className={`${className} overflow-hidden`}>
      <CardHeader className="bg-gradient-to-r from-[#245064] to-[#2e6478] text-white pb-4">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Treatment Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Progress Overview */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm font-bold text-[#245064]">
              {completedSessions} / {totalSessions} Sessions
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#245064] to-[#2e6478] transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white mix-blend-difference">
              {Math.round(progressPercentage)}%
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto mb-1" />
            <div className="text-2xl font-bold text-green-700">{completedSessions}</div>
            <div className="text-xs text-green-600">Completed</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
            <Clock className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <div className="text-2xl font-bold text-blue-700">{remainingSessions}</div>
            <div className="text-xs text-blue-600">Remaining</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
            <TrendingUp className="h-5 w-5 text-purple-600 mx-auto mb-1" />
            <div className="text-2xl font-bold text-purple-700">{Math.round(progressPercentage)}%</div>
            <div className="text-xs text-purple-600">Complete</div>
          </div>
        </div>

        {/* Session Checkboxes Visual */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Session Timeline</h4>
          <div className="grid grid-cols-5 gap-3">
            {sessionList.map((session) => (
              <div
                key={session.number}
                className={`
                  relative flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all duration-300
                  ${session.completed 
                    ? 'bg-green-50 border-green-500 shadow-sm' 
                    : 'bg-gray-50 border-gray-300'
                  }
                `}
              >
                {session.completed ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600 mb-1" />
                ) : (
                  <Circle className="h-6 w-6 text-gray-400 mb-1" />
                )}
                <span className={`text-xs font-bold ${
                  session.completed ? 'text-green-700' : 'text-gray-500'
                }`}>
                  #{session.number}
                </span>
                {session.date && (
                  <span className="text-[10px] text-gray-500 mt-1">
                    {new Date(session.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Progress Status Badge */}
        <div className="flex items-center justify-center mt-6">
          {progressPercentage === 100 ? (
            <Badge className="bg-green-600 text-white px-4 py-2">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Treatment Completed
            </Badge>
          ) : progressPercentage >= 50 ? (
            <Badge className="bg-blue-600 text-white px-4 py-2">
              <TrendingUp className="h-4 w-4 mr-2" />
              Treatment In Progress - {Math.round(progressPercentage)}% Complete
            </Badge>
          ) : (
            <Badge className="bg-[#245064] text-white px-4 py-2">
              <Activity className="h-4 w-4 mr-2" />
              Treatment Started - {Math.round(progressPercentage)}% Complete
            </Badge>
          )}
        </div>

        {/* Motivational Message */}
        {progressPercentage > 0 && progressPercentage < 100 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 text-center">
              {remainingSessions === 1 
                ? '🎉 Just one more session to go! Keep up the great work!' 
                : `💪 ${remainingSessions} more sessions to reach your treatment goals!`
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

