"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FileText, Plus, Clock, CheckCircle, Edit3, Trash2, Image as ImageIcon, X, Upload, ZoomIn } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import type { Patient } from '@/lib/data-service'
import { createClient } from '@supabase/supabase-js'
import Image from 'next/image'

interface ImageAttachment {
  id: string
  url: string
  fileName: string
  uploadedAt: string
  size: number
}

interface TreatmentNote {
  id: string
  patientId: string
  patientName: string
  sessionNumber: number
  date: string
  notes: string
  diagnosis: string
  treatmentProvided: string
  nextSteps: string
  images?: ImageAttachment[]
  createdBy: string
  createdAt: string
}

interface TreatmentNotesProps {
  patient: Patient
  onNotesUpdated?: () => void
  isDarkMode?: boolean
}

export function TreatmentNotes({ patient, onNotesUpdated, isDarkMode = false }: TreatmentNotesProps) {
  const [notes, setNotes] = useState<TreatmentNote[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<TreatmentNote | null>(null)
  const [newNote, setNewNote] = useState({
    notes: '',
    diagnosis: '',
    treatmentProvided: '',
    nextSteps: ''
  })
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [viewingImage, setViewingImage] = useState<string | null>(null)
  const [viewingNote, setViewingNote] = useState<TreatmentNote | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const { toast } = useToast()
  
  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Load notes from localStorage on mount
  useEffect(() => {
    loadNotes()
  }, [patient.id])

  const loadNotes = () => {
    try {
      const storedNotes = localStorage.getItem('treatment_notes')
      if (storedNotes) {
        const allNotes: TreatmentNote[] = JSON.parse(storedNotes)
        const patientNotes = allNotes.filter(n => n.patientId === patient.id)
        setNotes(patientNotes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
      }
    } catch (error) {
      console.error('Error loading treatment notes:', error)
    }
  }

  const validateAndAddFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/')
      const isUnder5MB = file.size <= 5 * 1024 * 1024
      if (!isImage) {
        toast({ title: 'Invalid file', description: `${file.name} is not an image`, variant: 'destructive' })
      }
      if (!isUnder5MB) {
        toast({ title: 'File too large', description: `${file.name} exceeds 5MB`, variant: 'destructive' })
      }
      return isImage && isUnder5MB
    })
    if (validFiles.length > 0) {
      setSelectedImages(prev => [...prev, ...validFiles])
      validFiles.forEach(file => {
        const reader = new FileReader()
        reader.onloadend = () => setImagePreviewUrls(prev => [...prev, reader.result as string])
        reader.readAsDataURL(file)
      })
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    validateAndAddFiles(files)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(false)
    const files = Array.from(e.dataTransfer.files || [])
    validateAndAddFiles(files)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = () => setDragActive(false)
  
  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index))
  }
  
  const uploadImages = async (): Promise<ImageAttachment[]> => {
    if (selectedImages.length === 0) return []
    
    setIsUploading(true)
    const uploadedImages: ImageAttachment[] = []
    
    try {
      for (const file of selectedImages) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${patient.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
        
        const { data, error } = await supabase.storage
          .from('treatment-notes')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          })
        
        if (error) {
          console.error('Upload error:', error)
          toast({
            title: 'Upload failed',
            description: `Failed to upload ${file.name}`,
            variant: 'destructive'
          })
          continue
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('treatment-notes')
          .getPublicUrl(fileName)
        
        uploadedImages.push({
          id: `IMG${Date.now()}${Math.random().toString(36).substring(7)}`,
          url: publicUrl,
          fileName: file.name,
          uploadedAt: new Date().toISOString(),
          size: file.size
        })
      }
      
      return uploadedImages
    } catch (error) {
      console.error('Error during upload:', error)
      toast({
        title: 'Upload error',
        description: 'An error occurred while uploading images',
        variant: 'destructive'
      })
      return uploadedImages
    } finally {
      setIsUploading(false)
    }
  }

  const saveNote = async () => {
    try {
      setIsUploading(true)
      const sessionNumber = (patient.sessions_completed || 0) + 1
      
      // Upload images first
      const uploadedImages = await uploadImages()
      
      const note: TreatmentNote = {
        id: `TN${Date.now()}`,
        patientId: patient.id,
        patientName: patient.name,
        sessionNumber,
        date: new Date().toISOString(),
        notes: newNote.notes,
        diagnosis: newNote.diagnosis,
        treatmentProvided: newNote.treatmentProvided,
        nextSteps: newNote.nextSteps,
        images: uploadedImages,
        createdBy: localStorage.getItem('admin_email') || 'Admin',
        createdAt: new Date().toISOString()
      }

      // Save to localStorage
      const storedNotes = localStorage.getItem('treatment_notes')
      const allNotes: TreatmentNote[] = storedNotes ? JSON.parse(storedNotes) : []
      allNotes.push(note)
      localStorage.setItem('treatment_notes', JSON.stringify(allNotes))

      // Reset form
      setNewNote({ notes: '', diagnosis: '', treatmentProvided: '', nextSteps: '' })
      setSelectedImages([])
      setImagePreviewUrls([])
      setIsAddDialogOpen(false)
      
      // Open the newly created note in viewer
      setViewingNote(note)
      setIsViewDialogOpen(true)

      loadNotes()
      onNotesUpdated?.()

      toast({
        title: "✅ Treatment Note Saved",
        description: `Session ${sessionNumber} note with ${uploadedImages.length} image(s) added successfully`
      })
    } catch (error) {
      console.error('Error saving treatment note:', error)
      toast({
        title: "Error",
        description: "Failed to save treatment note",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }

  const deleteNote = (noteId: string) => {
    try {
      const storedNotes = localStorage.getItem('treatment_notes')
      if (storedNotes) {
        const allNotes: TreatmentNote[] = JSON.parse(storedNotes)
        const filteredNotes = allNotes.filter(n => n.id !== noteId)
        localStorage.setItem('treatment_notes', JSON.stringify(filteredNotes))
        loadNotes()
        toast({
          title: "🗑️ Note Deleted",
          description: "Treatment note removed successfully"
        })
      }
    } catch (error) {
      console.error('Error deleting note:', error)
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-[#0d5c75]'}`}>
            Treatment Notes
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Session-by-session treatment documentation
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-[#2a9d8f] hover:bg-[#238a7a]">
              <Plus className="h-4 w-4 mr-2" />
              Add Note
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl w-[95vw]">
            <DialogHeader>
              <DialogTitle className="text-[#0d5c75]">
                Add Treatment Note - Session {(patient.sessions_completed || 0) + 1}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Form fields */}
              <div className="grid grid-cols-1 gap-4">
                <div className="col-span-1">
                  <Label>Clinical Notes</Label>
                  <Textarea
                    value={newNote.notes}
                    onChange={(e) => setNewNote({ ...newNote, notes: e.target.value })}
                    placeholder="Document observations, patient feedback, etc."
                    className="min-h-[120px]"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Diagnosis / Assessment</Label>
                    <Textarea
                      value={newNote.diagnosis}
                      onChange={(e) => setNewNote({ ...newNote, diagnosis: e.target.value })}
                      placeholder="Current diagnosis and assessment findings"
                      className="min-h-[100px]"
                    />
                  </div>
                  <div>
                    <Label>Treatment Provided</Label>
                    <Textarea
                      value={newNote.treatmentProvided}
                      onChange={(e) => setNewNote({ ...newNote, treatmentProvided: e.target.value })}
                      placeholder="Adjustments, techniques used, etc."
                      className="min-h-[100px]"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Next Steps / Recommendations</Label>
                    <Textarea
                      value={newNote.nextSteps}
                      onChange={(e) => setNewNote({ ...newNote, nextSteps: e.target.value })}
                      placeholder="Follow-up plan, home care instructions, etc."
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              </div>
              
              {/* Image Upload Section */}
              <div className="border-t pt-4">
                <Label className="flex items-center gap-2 mb-2">
                  <ImageIcon className="h-4 w-4" />
                  Attach Images (X-rays, Diagrams, Photos)
                </Label>
                <p className="text-xs text-gray-500 mb-3">
                  Upload images to document visual findings, X-rays, posture diagrams, or treatment progress. Max 5MB per image.
                </p>
                
                <div className="space-y-3">
                  {/* Drag & Drop Zone */}
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`transition-colors rounded-lg p-4 border-2 border-dashed ${dragActive ? 'border-[#2a9d8f] bg-[#2a9d8f]/5' : 'border-gray-300'} flex flex-col sm:flex-row items-center justify-between gap-3`}
                  >
                    <div className="text-sm text-gray-600">
                      Drag & drop images here, or choose files
                    </div>
                    <div>
                      <input
                        type="file"
                        id={`image-upload-${patient.id}`}
                        multiple
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                      <label htmlFor={`image-upload-${patient.id}`} className="cursor-pointer">
                        <div className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-[#2a9d8f] text-[#0d5c75] hover:bg-[#2a9d8f]/10 h-10 px-4 py-2">
                          <Upload className="h-4 w-4 mr-2" />
                          Choose Images
                        </div>
                      </label>
                    </div>
                  </div>
                  
                  {/* Image Previews */}
                  {imagePreviewUrls.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {imagePreviewUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-lg border-2 border-gray-200 overflow-hidden">
                            <Image
                              src={url}
                              alt={`Preview ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <p className="text-xs text-gray-500 mt-1 truncate" title={selectedImages[index]?.name}>
                            {selectedImages[index]?.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isUploading}>
                  Cancel
                </Button>
                <Button onClick={saveNote} className="bg-[#0d5c75] hover:bg-[#0a4a5c]" disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <Upload className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Save Note'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Notes List */}
      <div className="space-y-3">
        {notes.length === 0 ? (
          <Card className={isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}>
            <CardContent className="py-8 text-center">
              <FileText className={`h-12 w-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No treatment notes yet. Add your first note to start documenting this patient's progress.
              </p>
            </CardContent>
          </Card>
        ) : (
          notes.map((note) => (
            <Card key={note.id} className={`border-l-4 border-l-[#2a9d8f] ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-[#2a9d8f]">
                      Session {note.sessionNumber}
                    </Badge>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      {new Date(note.date).toLocaleDateString()} at {new Date(note.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteNote(note.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Compact summary only (no full text shown openly) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Summary</p>
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} line-clamp-2`}>
                      {note.notes || note.diagnosis || note.treatmentProvided || 'No summary provided.'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Attachments</p>
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {note.images?.length ? `${note.images.length} image(s)` : 'No images'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Created By</p>
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{note.createdBy}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="text-xs text-gray-500">
                    {new Date(note.createdAt).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2">
                    {note.images?.length ? (
                      <Badge variant="secondary" className="bg-[#2a9d8f]/10 text-[#0d5c75]">{note.images.length} Images</Badge>
                    ) : null}
                    <Button size="sm" variant="outline" className="border-[#0d5c75] text-[#0d5c75] hover:bg-[#0d5c75]/10" onClick={() => { setViewingNote(note); setIsViewDialogOpen(true) }}>
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      {/* Note Viewer Dialog (Professional, Responsive) */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto p-0">
          <div className="bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] px-6 py-5">
            <DialogHeader>
              <DialogTitle className="text-white text-xl flex items-center justify-between">
                <span>Session #{viewingNote?.sessionNumber} • Treatment Note</span>
                <span className="text-white/80 text-sm">{viewingNote ? new Date(viewingNote.date).toLocaleString() : ''}</span>
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6 space-y-6">
            {/* Top meta */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 border">
                <p className="text-xs text-gray-500">Patient</p>
                <p className="font-medium text-[#0d5c75]">{viewingNote?.patientName}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border">
                <p className="text-xs text-gray-500">Created By</p>
                <p className="font-medium">{viewingNote?.createdBy}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border">
                <p className="text-xs text-gray-500">Attachments</p>
                <p className="font-medium">{viewingNote?.images?.length || 0} image(s)</p>
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {viewingNote?.notes && (
                <div>
                  <h4 className="text-sm font-semibold text-[#0d5c75] mb-2">Clinical Notes</h4>
                  <div className="bg-white rounded-lg p-4 border text-sm text-gray-800 whitespace-pre-wrap">
                    {viewingNote.notes}
                  </div>
                </div>
              )}
              {viewingNote?.diagnosis && (
                <div>
                  <h4 className="text-sm font-semibold text-[#0d5c75] mb-2">Diagnosis / Assessment</h4>
                  <div className="bg-white rounded-lg p-4 border text-sm text-gray-800 whitespace-pre-wrap">
                    {viewingNote.diagnosis}
                  </div>
                </div>
              )}
              {viewingNote?.treatmentProvided && (
                <div>
                  <h4 className="text-sm font-semibold text-[#0d5c75] mb-2">Treatment Provided</h4>
                  <div className="bg-white rounded-lg p-4 border text-sm text-gray-800 whitespace-pre-wrap">
                    {viewingNote.treatmentProvided}
                  </div>
                </div>
              )}
              {viewingNote?.nextSteps && (
                <div>
                  <h4 className="text-sm font-semibold text-[#0d5c75] mb-2">Next Steps / Recommendations</h4>
                  <div className="bg-white rounded-lg p-4 border text-sm text-gray-800 whitespace-pre-wrap">
                    {viewingNote.nextSteps}
                  </div>
                </div>
              )}
            </div>

            {/* Image gallery */}
            {viewingNote?.images && viewingNote.images.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-[#0d5c75] mb-3 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Attached Images
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {viewingNote.images.map(img => (
                    <div key={img.id} className="relative group">
                      <div
                        className="aspect-square rounded-lg border overflow-hidden cursor-pointer hover:border-[#2a9d8f] transition-colors"
                        onClick={() => setViewingImage(img.url)}
                      >
                        <Image src={img.url} alt={img.fileName} fill className="object-cover group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-xs text-gray-500 mt-1 truncate" title={img.fileName}>{img.fileName}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Viewer Dialog */}
      <Dialog open={!!viewingImage} onOpenChange={() => setViewingImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-[#0d5c75]">Image Viewer</DialogTitle>
          </DialogHeader>
          {viewingImage && (
            <div className="relative w-full h-[70vh]">
              <Image
                src={viewingImage}
                alt="Full size view"
                fill
                className="object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

