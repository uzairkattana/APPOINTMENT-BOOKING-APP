"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone, MessageCircle, MapPin, Award, Stethoscope, Clock } from "lucide-react"
import { useLanguage } from "./language-provider"
import Image from "next/image"

export function DoctorProfile() {
  const { t, language } = useLanguage()

  return (
    <Card className="bg-gradient-to-br from-[#f4f1de] to-white border-[#2a9d8f] border-2 shadow-xl">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Logo/Avatar */}
          <div className="flex-shrink-0">
            <Image
              src="/images/gonstead-logo.png"
              alt="Dr. Bahir"
              width={120}
              height={120}
              className="rounded-full border-4 border-[#2a9d8f] shadow-lg"
            />
          </div>

          {/* Doctor Info */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-[#2a9d8f] mb-2">{t("doctor.name")}</h1>
            <h2 className="text-xl text-gray-700 mb-4">{t("doctor.title")}</h2>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Award className="h-5 w-5 text-[#2a9d8f]" />
                <span className="text-gray-700">{t("doctor.experience")}</span>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-2">
                <Stethoscope className="h-5 w-5 text-[#2a9d8f]" />
                <span className="text-gray-700">{t("doctor.expertise")}</span>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-2">
                <Clock className="h-5 w-5 text-[#2a9d8f]" />
                <span className="text-gray-700">
                  {language === "ur" ? "دستیاب: ہفتے کے 6 دن" : "Available: 6 days a week"}
                </span>
              </div>
            </div>

            {/* Professional Description */}
            <div className="bg-white p-4 rounded-lg shadow-inner mb-6">
              <p className="text-gray-700 leading-relaxed">
                {language === "ur"
                  ? "ڈاکٹر باہر گونسٹیڈ کائروپریکٹک میں 5 سال کا خصوصی تجربہ رکھتے ہیں۔ جدید مشینری کی مدد سے ریڑھ کی ہڈی کی درستگی اور مکمل علاج کے ماہر ہیں۔"
                  : "Doctor Bahir has 5 years of specialized experience in Gonstead Chiropractic. Expert in advanced machine-assisted bone alignment adjustments and holistic spinal correction techniques. Precision-driven care with innovative technology for optimal patient-centered outcomes."}
              </p>
            </div>
          </div>
        </div>

        {/* Clinic Location & Contact */}
        <div className="bg-white p-4 rounded-lg shadow-inner">
          <h3 className="font-bold text-[#2a9d8f] mb-3 flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {language === "ur" ? "کلینک کا پتہ:" : "Clinic Location:"}
          </h3>
          <p className="text-gray-700 mb-4">{t("clinic.location")}</p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="bg-[#2a9d8f] hover:bg-[#238a7a] flex-1">
              <a href="tel:+923046996267" className="flex items-center justify-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+92 304 6996267</span>
              </a>
            </Button>

            <Button asChild variant="outline" className="border-green-500 text-green-600 hover:bg-green-50 flex-1">
              <a
                href="https://wa.me/923046996267"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{t("contact.whatsapp")}</span>
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
