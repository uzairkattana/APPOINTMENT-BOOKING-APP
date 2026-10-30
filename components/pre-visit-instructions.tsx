"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  FileText, 
  Camera, 
  Stethoscope,
  ArrowRight,
  AlertTriangle,
  Info
} from "lucide-react"
import { useLanguage } from "./language-provider"

interface PreVisitInstructionsProps {
  className?: string
  showTitle?: boolean
}

export function PreVisitInstructions({ 
  className = "", 
  showTitle = true 
}: PreVisitInstructionsProps) {
  const { language } = useLanguage()
  const isUrdu = language === "ur"

  return (
    <Card className={`shadow-lg border-amber-400 appointment-card-hover ${className}`}>
      {showTitle && (
        <CardHeader className="bg-gradient-to-r from-amber-400 to-orange-400 text-white">
          <CardTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-6 w-6" />
            {isUrdu ? "ملاقات سے پہلے اہم ہدایات" : "Important Pre-Visit Information"}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-6">
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-amber-800 font-bold mb-2">
                {isUrdu 
                  ? "⚠️ اہم: اپنی حالت سے متعلق تمام ضروری اشیاء ضرور ساتھ لائیں"
                  : "⚠️ Important: Please bring all relevant items related to your condition"
                }
              </p>
              <p className="text-amber-700 text-sm">
                {isUrdu
                  ? "یہ ہمارے گونستیڈ کائروپریکٹک پریکٹیشنر کو آپ کی حالت بہتر سمجھنے اور موثر علاج فراہم کرنے میں مدد کرتا ہے۔"
                  : "This helps our Gonstead Chiropractic Practitioner better understand your condition and provide the most effective treatment."
                }
              </p>
            </div>
          </div>
        </div>

        {/* Complete bilingual message as requested */}
        <div className="space-y-6">
          {/* English Version */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-[#2a9d8f]" />
              Required Documents:
            </h3>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-3">
              <div className="flex items-start gap-3">
                <Camera className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-blue-800">Recent X-rays, MRI or CT Scans</p>
                  <p className="text-sm text-blue-700">Any recent imaging studies if available</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-green-800">Medical Reports or Diagnosis Documents</p>
                  <p className="text-sm text-green-700">Any medical reports from previous doctors</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Stethoscope className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-purple-800">Previous Treatment History</p>
                  <p className="text-sm text-purple-700">Your previous treatment history and medications</p>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-700 bg-white p-4 rounded-lg border">
              <p className="mb-2">
                <strong>Please take a moment to review this important information before your visit.</strong> 
                It is essential that you bring all relevant items related to your condition so we can provide you 
                with the most accurate and personalized care.
              </p>
              <p>
                This allows our Gonstead Chiropractic Practitioner to better understand your condition and 
                deliver the best possible treatment.
              </p>
            </div>
          </div>

          {/* Urdu Version */}
          <div className="space-y-4" dir="rtl">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-[#2a9d8f]" />
              ضروری دستاویزات:
            </h3>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 space-y-3">
              <div className="flex items-start gap-3">
                <Camera className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-right">
                  <p className="font-medium text-blue-800">حالیہ ایکس رے، ایم آر آئی یا سی ٹی اسکین</p>
                  <p className="text-sm text-blue-700">اگر دستیاب ہوں تو حالیہ تصویری معائنے</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-right">
                  <p className="font-medium text-green-800">میڈیکل رپورٹس یا تشخیص کی دستاویزات</p>
                  <p className="text-sm text-green-700">پچھلے ڈاکٹروں کی کوئی بھی طبی رپورٹ</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Stethoscope className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div className="text-right">
                  <p className="font-medium text-purple-800">پچھلے علاج کی تاریخ</p>
                  <p className="text-sm text-purple-700">آپ کے پچھلے علاج کی تاریخ اور ادویات</p>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-700 bg-white p-4 rounded-lg border text-right">
              <p className="mb-2">
                <strong>ملاقات کامیابی سے بک ہو گئی ہے۔</strong> گونستیڈ کائروپریکٹک کلینک میں آپ کی ملاقات کا شکریہ۔ 
                براہ کرم ملاقات پر آنے سے پہلے یہ اہم ہدایات ضرور پڑھیں۔
              </p>
              <p className="mb-2">
                اپنے مسئلے سے متعلق تمام ضروری اشیاء ضرور ساتھ لائیں تاکہ ہم آپ کی حالت کو بہتر طور پر سمجھ سکیں 
                اور مؤثر علاج فراہم کر سکیں۔
              </p>
              <p>
                آپ کو لازمی طور پر ساتھ لانا چاہیے: حالیہ ایکس رے، اگر دستیاب ہوں تو ایم آر آئی یا سی ٹی اسکین، 
                میڈیکل رپورٹس یا تشخیص کی دستاویزات، اور پچھلے علاج کی تاریخ۔
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
