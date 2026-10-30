"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Database, MessageCircle, CheckCircle, AlertCircle } from 'lucide-react'

export default function SetupChat() {
  const [isCopied, setIsCopied] = useState(false)

  const sqlCode = `-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('admin', 'staff')),
  receiver_id TEXT NOT NULL,
  receiver_role TEXT NOT NULL CHECK (receiver_role IN ('admin', 'staff')),
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_receiver_id ON chat_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_read ON chat_messages(read);

-- Enable Row Level Security (RLS)
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for chat messages
CREATE POLICY "Users can view their own messages" ON chat_messages
  FOR SELECT USING (
    auth.uid()::text = sender_id OR 
    auth.uid()::text = receiver_id
  );

CREATE POLICY "Users can insert their own messages" ON chat_messages
  FOR INSERT WITH CHECK (
    auth.uid()::text = sender_id
  );

CREATE POLICY "Users can update read status" ON chat_messages
  FOR UPDATE USING (
    auth.uid()::text = receiver_id
  );`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlCode)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <MessageCircle className="h-8 w-8 text-emerald-600" />
            <h1 className="text-3xl font-bold text-gray-900">Chat System Setup</h1>
          </div>
          <p className="text-gray-600">Set up the database tables for the real-time chat system</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Setup Instructions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-emerald-100 p-2 rounded-full mt-1">
                  <span className="text-emerald-600 font-semibold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold">Open Supabase Dashboard</h3>
                  <p className="text-sm text-gray-600">Go to your Supabase project dashboard</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-emerald-100 p-2 rounded-full mt-1">
                  <span className="text-emerald-600 font-semibold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold">Navigate to SQL Editor</h3>
                  <p className="text-sm text-gray-600">Click "SQL Editor" in the left sidebar</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-emerald-100 p-2 rounded-full mt-1">
                  <span className="text-emerald-600 font-semibold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold">Paste & Run SQL</h3>
                  <p className="text-sm text-gray-600">Copy the SQL code and click "Run"</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-emerald-100 p-2 rounded-full mt-1">
                  <span className="text-emerald-600 font-semibold">4</span>
                </div>
                <div>
                  <h3 className="font-semibold">Test Chat System</h3>
                  <p className="text-sm text-gray-600">Try sending messages in staff/admin dashboards</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SQL Code */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>SQL Code</span>
                </div>
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  size="sm"
                >
                  {isCopied ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4 mr-2" />
                      Copy SQL
                    </>
                  )}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm">
                  <code>{sqlCode}</code>
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-8 w-8 text-yellow-500" />
                <div>
                  <h3 className="font-semibold">Before Setup</h3>
                  <p className="text-sm text-gray-600">Chat shows errors when sending messages</p>
                  <Badge variant="outline" className="mt-2 border-yellow-500 text-yellow-700">
                    Not Working
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Database className="h-8 w-8 text-blue-500" />
                <div>
                  <h3 className="font-semibold">During Setup</h3>
                  <p className="text-sm text-gray-600">Run SQL in Supabase dashboard</p>
                  <Badge variant="outline" className="mt-2 border-blue-500 text-blue-700">
                    In Progress
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <h3 className="font-semibold">After Setup</h3>
                  <p className="text-sm text-gray-600">Real-time chat works perfectly</p>
                  <Badge variant="outline" className="mt-2 border-green-500 text-green-700">
                    Working
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
                className="w-full"
              >
                <Database className="h-4 w-4 mr-2" />
                Open Supabase Dashboard
              </Button>
              <Button
                onClick={() => window.open('/staff-dashboard', '_blank')}
                variant="outline"
                className="w-full"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Test Staff Chat
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
