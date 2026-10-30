"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Phone,
  MessageCircle,
  MapPin,
  Award,
  Stethoscope,
  Clock,
  Star,
  Users,
  BookOpen,
  Trophy,
  Heart,
} from "lucide-react"
import { useLanguage } from "./language-provider"
import Image from "next/image"

export function ComprehensiveDoctorProfile() {
  const { t, language } = useLanguage()

  const achievements = [
    {
      icon: <Trophy className="h-6 w-6" style={{ color: 'rgb(227,252,236)' }} />,
      title: language === "ur" ? "گونسٹیڈ سرٹیفیکیشن" : "Gonstead Certification",
      description:
        language === "ur"
          ? "بین الاقوامی گونسٹیڈ انسٹی ٹیوٹ سے تصدیق شدہ"
          : "Certified by International Gonstead Institute",
    },
    {
      icon: <Users className="h-6 w-6 text-blue-500" />,
      title: language === "ur" ? "500+ مریض" : "500+ Patients Treated",
      description: language === "ur" ? "کامیاب علاج کے ساتھ" : "With successful recovery outcomes",
    },
    {
      icon: <Star className="h-6 w-6 text-green-500" />,
      title: language === "ur" ? "95% کامیابی کی شرح" : "95% Success Rate",
      description: language === "ur" ? "مریضوں کی بہتری میں" : "In patient improvement",
    },
    {
      icon: <BookOpen className="h-6 w-6 text-purple-500" />,
      title: language === "ur" ? "مسلسل تعلیم" : "Continuous Education",
      description: language === "ur" ? "جدید تکنیکوں میں تربیت" : "Training in latest techniques",
    },
  ]

  const specializations = [
    {
      title: language === "ur" ? "گونسٹیڈ ایڈجسٹمنٹ" : "Gonstead Adjustments",
      description: language === "ur" ? "درست اور محفوظ ریڑھ کی ہڈی کی درستگی" : "Precise and safe spinal corrections",
      level: "Expert",
    },
    {
      title: language === "ur" ? "مشین اسسٹڈ تھراپی" : "Machine-Assisted Therapy",
      description: language === "ur" ? "جدید آرتھروسٹم ٹیکنالوجی" : "Advanced Arthrostim technology",
      level: "Advanced",
    },
    {
      title: language === "ur" ? "درد کا علاج" : "Pain Management",
      description: language === "ur" ? "دائمی اور شدید درد کا علاج" : "Chronic and acute pain treatment",
      level: "Expert",
    },
    {
      title: language === "ur" ? "پوسچر کریکشن" : "Posture Correction",
      description: language === "ur" ? "کام کی وجہ سے ہونے والے مسائل" : "Work-related postural issues",
      level: "Advanced",
    },
  ]

  const workingHours = [
    { day: language === "ur" ? "پیر" : "Monday", hours: "9:00 AM - 6:00 PM" },
    { day: language === "ur" ? "منگل" : "Tuesday", hours: "9:00 AM - 6:00 PM" },
    { day: language === "ur" ? "بدھ" : "Wednesday", hours: "9:00 AM - 6:00 PM" },
    { day: language === "ur" ? "جمعرات" : "Thursday", hours: "9:00 AM - 6:00 PM" },
    { day: language === "ur" ? "جمعہ" : "Friday", hours: "9:00 AM - 6:00 PM" },
    { day: language === "ur" ? "ہفتہ" : "Saturday", hours: "9:00 AM - 2:00 PM" },
    { day: language === "ur" ? "اتوار" : "Sunday", hours: language === "ur" ? "بند" : "Closed" },
  ]

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Main Profile Card */}
      <Card className="bg-gradient-to-br from-[#f4f1de] to-white dark:from-gray-800 dark:to-gray-900 border-[#2a9d8f] border-2 shadow-2xl overflow-hidden">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col lg:flex-row items-center gap-6 md:gap-8">
            {/* Profile Image */}
            <div className="flex-shrink-0 relative">
              <div className="relative">
                <Image
            src="/images/gonstead-chiropractic-logo-new.png"
                  alt="Dr. Bahir"
                  width={170}
                  height={170}
                  className="rounded-full border border-[#2a9d8f]/40 shadow-2xl bg-white p-1"
                />
                <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-2">
                  <Heart className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Doctor Info */}
            <div className="flex-1 text-center lg:text-left space-y-4 md:space-y-6">
              <div>
                <h1 className="text-3xl md:text-5xl font-bold text-[#2a9d8f] dark:text-[#3fb3a3] mb-2">
                  {t("doctor.name")}
                </h1>
                <h2 className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-4">{t("doctor.title")}</h2>
                <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-4">
                  <Badge variant="secondary" className="bg-[#2a9d8f] text-white">
                    {language === "ur" ? "گونسٹیڈ ماہر" : "Gonstead Specialist"}
                  </Badge>
                  <Badge variant="outline" className="border-[#2a9d8f] text-[#2a9d8f]">
                    {language === "ur" ? "5 سال تجربہ" : "5 Years Experience"}
                  </Badge>
                  <Badge variant="outline" className="border-green-500 text-green-600">
                    {language === "ur" ? "دستیاب" : "Available"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <Award className="h-5 w-5 text-[#2a9d8f]" />
                  <span className="text-gray-700 dark:text-gray-300">{t("doctor.experience")}</span>
                </div>

                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <Stethoscope className="h-5 w-5 text-[#2a9d8f]" />
                  <span className="text-gray-700 dark:text-gray-300">{t("doctor.expertise")}</span>
                </div>

                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <MapPin className="h-5 w-5 text-[#2a9d8f]" />
                  <span className="text-gray-700 dark:text-gray-300">{t("clinic.location")}</span>
                </div>

                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <Clock className="h-5 w-5 text-[#2a9d8f]" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {language === "ur" ? "دستیاب: ہفتے کے 6 دن" : "Available: 6 days a week"}
                  </span>
                </div>
              </div>

              {/* Professional Description */}
              <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl shadow-inner">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm md:text-base">
                  {language === "ur"
                    ? "ڈاکٹر باہر گونسٹیڈ کائروپریکٹک میں 5 سال کا خصوصی تجربہ رکھتے ہیں۔ جدید مشینری کی مدد سے ریڑھ کی ہڈی کی درستگی اور مکمل علاج کے ماہر ہیں۔ انہوں نے 500+ مریضوں کا کامیاب علاج کیا ہے اور 95% کامیابی کی شرح رکھتے ہیں۔"
                    : "Dr. Bahir has 5 years of specialized experience in Gonstead Chiropractic. Expert in advanced machine-assisted bone alignment adjustments and holistic spinal correction techniques. He has successfully treated 500+ patients with a 95% success rate in patient improvement and pain relief."}
                </p>
              </div>

              {/* Contact Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
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
          </div>
        </CardContent>
      </Card>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {achievements.map((achievement, index) => (
          <Card
            key={index}
            className="border-[#2a9d8f]/20 hover:border-[#2a9d8f] hover:shadow-lg transition-all duration-300"
          >
            <CardContent className="p-4 md:p-6 text-center">
              <div className="flex justify-center mb-3">{achievement.icon}</div>
              <h3 className="font-bold text-[#2a9d8f] dark:text-[#3fb3a3] mb-2 text-sm md:text-base">
                {achievement.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">{achievement.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Specializations and Working Hours */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Specializations */}
        <Card className="border-[#2a9d8f]/20">
          <CardHeader>
            <CardTitle className="text-[#2a9d8f] dark:text-[#3fb3a3] flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              {language === "ur" ? "خصوصی مہارت" : "Specializations"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {specializations.map((spec, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm md:text-base">{spec.title}</h4>
                  <Badge variant="outline" className="text-xs">
                    {spec.level}
                  </Badge>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">{spec.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Working Hours */}
        <Card className="border-[#2a9d8f]/20">
          <CardHeader>
            <CardTitle className="text-[#2a9d8f] dark:text-[#3fb3a3] flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {language === "ur" ? "کام کے اوقات" : "Working Hours"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {workingHours.map((schedule, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="font-medium text-gray-800 dark:text-gray-200 text-sm md:text-base">
                  {schedule.day}
                </span>
                <span
                  className={`text-sm md:text-base ${schedule.hours.includes("Closed") || schedule.hours.includes("بند") ? "text-red-500" : "text-green-600"}`}
                >
                  {schedule.hours}
                </span>
              </div>
            ))}
            <div className="mt-4 p-3 bg-[#2a9d8f]/10 rounded-lg">
              <p className="text-[#2a9d8f] text-xs md:text-sm font-medium text-center">
                {language === "ur"
                  ? "ایمرجنسی کے لیے 24/7 ویڈیو کنسلٹیشن دستیاب"
                  : "24/7 Emergency video consultation available"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
