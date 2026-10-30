"use client"

import { Card, CardContent } from "@/components/ui/card"
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
  Mail,
} from "lucide-react"
import { useLanguage } from "./language-provider"
import { useState } from "react"
import Image from "next/image"

export function EnhancedDoctorProfile() {
  const { t, language } = useLanguage()
  const [isHovered, setIsHovered] = useState(false)

  const achievements = [
    {
      icon: <Trophy className="h-6 w-6 text-[#f3a800]" />,
      title: language === "ur" ? "گونسٹیڈ سرٹیفیکیشن V" : "Gonstead Certification V",
      description: language === "ur" ? "اعلیٰ ترین سطح کی تصدیق" : "Highest level certification",
    },
    {
      icon: <Users className="h-6 w-6 text-[#0d5c75]" />,
      title: language === "ur" ? "1000+ مریض" : "1000+ Patients Treated",
      description: language === "ur" ? "کامیاب علاج کے ساتھ" : "With successful outcomes",
    },
    {
      icon: <Star className="h-6 w-6 text-[#f3a800]" />,
      title: language === "ur" ? "98% کامیابی کی شرح" : "98% Success Rate",
      description: language === "ur" ? "مریضوں کی بہتری میں" : "In patient improvement",
    },
    {
      icon: <BookOpen className="h-6 w-6 text-[#0d5c75]" />,
      title: language === "ur" ? "مسلسل تعلیم" : "Continuous Education",
      description: language === "ur" ? "جدید تکنیکوں میں تربیت" : "Training in latest techniques",
    },
  ]

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Main Profile Card with Spinal Animation */}
      <Card className="bg-gradient-to-br from-[#F8F5F0] to-[#FEFCF8] dark:from-gray-800 dark:to-gray-900 border-[#0d5c75] border-2 shadow-2xl overflow-hidden relative">
        {/* Animated Spine Background */}
        <div className="absolute inset-0 opacity-5">
          <div className="spine-animation">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="vertebra"
                style={{
                  animationDelay: `${i * 0.1}s`,
                  top: `${8 + i * 7}%`,
                }}
              />
            ))}
          </div>
        </div>

        <CardContent className="p-6 md:p-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-6 md:gap-8">
            {/* Profile Image with Golden Aura */}
            <div className="flex-shrink-0 relative">
              <div
                className={`relative transition-all duration-300 ${isHovered ? "animate-pulse" : ""}`}
                style={{
                  filter: isHovered
                    ? "drop-shadow(0 0 20px #f3a800) drop-shadow(0 0 40px #f3a800)"
                    : "drop-shadow(0 0 10px rgba(243, 168, 0, 0.3))",
                }}
              >
                <Image
            src="/images/gonstead-chiropractic-logo-new.png"
                  alt="Dr. Bashir"
                  width={200}
                  height={200}
                  className="rounded-full shadow-2xl bg-white p-1"
                />
                <div className="absolute -bottom-2 -right-2 bg-[#0d5c75] text-white rounded-full p-2">
                  <Heart className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Doctor Info with Animated Text */}
            <div className="flex-1 text-center lg:text-left space-y-4 md:space-y-6">
              <div>
                {/* Gold Gradient Text with Spine Underline */}
                <div className="relative">
                  <h1
                    className="text-3xl md:text-5xl font-bold mb-2 cursor-pointer font-poppins doctor-name-gradient"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                  >
                    {t("doctor.name")}
                  </h1>
                  <div className={`spine-underline ${isHovered ? "spine-underline-active" : ""}`}></div>
                </div>

                <h2 className="text-xl md:text-2xl text-[#0A3A47] dark:text-gray-300 mb-4 font-open-sans">
                  {t("doctor.title")}
                </h2>

                <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-4">
                  <Badge className="bg-[#f3a800] text-white hover:bg-[#e09700] font-poppins credential-badge">
                    <Award className="h-3 w-3 mr-1" />
                    {language === "ur" ? "گونسٹیڈ سپیشلسٹ V" : "Gonstead Specialist V"}
                  </Badge>
                  <Badge variant="outline" className="border-[#0d5c75] text-[#0d5c75] font-open-sans">
                    {language === "ur" ? "ایڈوانسڈ اسپیشلسٹ" : "Advanced Specialist"}
                  </Badge>
                  <Badge className="bg-green-500 text-white animate-pulse">
                    {language === "ur" ? "دستیاب" : "Available"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <Stethoscope className="h-5 w-5 text-[#0d5c75]" />
                  <span className="text-[#0A3A47] dark:text-gray-300 font-open-sans">{t("doctor.experience")}</span>
                </div>

                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <Award className="h-5 w-5 text-[#f3a800]" />
                  <span className="text-[#0A3A47] dark:text-gray-300 font-open-sans">{t("doctor.expertise")}</span>
                </div>

                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <MapPin className="h-5 w-5 text-[#0d5c75]" />
                  <span className="text-[#0A3A47] dark:text-gray-300 font-open-sans">{t("clinic.location")}</span>
                </div>

                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <Mail className="h-5 w-5 text-[#f3a800]" />
                  <span className="text-[#0A3A47] dark:text-gray-300 font-open-sans">{t("clinic.email")}</span>
                </div>

                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <Clock className="h-5 w-5 text-[#0d5c75]" />
                  <span className="text-[#0A3A47] dark:text-gray-300 font-open-sans">
                    {language === "ur" ? "24/7 ایمرجنسی کیئر" : "24/7 Emergency Care"}
                  </span>
                </div>
              </div>

              {/* Professional Description */}
              <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl shadow-inner border border-[#0d5c75]/20">
                <p className="text-[#0A3A47] dark:text-gray-300 leading-relaxed text-sm md:text-base font-open-sans">
                  {language === "ur"
                    ? "ڈاکٹر بشیر گونسٹیڈ کائروپریکٹک میں ایڈوانسڈ اسپیشلسٹ ہیں۔ انہوں نے 1000+ مریضوں کا کامیاب علاج کیا ہے اور 98% کامیابی کی شرح رکھتے ہیں۔ جدید ٹیکنالوجی اور درست تشخیص کے ماہر ہیں۔"
                    : "Dr. Bashir is an Advanced Gonstead Chiropractic Specialist with the highest level V certification. He has successfully treated over 1000 patients with a 98% success rate. Expert in precision spinal alignment using cutting-edge technology and advanced diagnostic techniques."}
                </p>
              </div>

              {/* Contact Buttons with Spine Wave Animation */}
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <Button asChild className="bg-[#0d5c75] hover:bg-[#0a4a5c] flex-1 spine-wave-btn font-poppins">
                  <a href="tel:+923046996267" className="flex items-center justify-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>+92 304 699 6267</span>
                  </a>
                </Button>

                <Button asChild className="bg-[#25d366] hover:bg-[#20b858] flex-1 spine-wave-btn font-poppins">
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

      {/* Achievements Grid with Vertebrae Reveal Animation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {achievements.map((achievement, index) => (
          <Card
            key={index}
            className="border-[#0d5c75]/20 hover:border-[#f3a800] hover:shadow-lg transition-all duration-300 vertebra-reveal bg-white"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardContent className="p-4 md:p-6 text-center">
              <div className="flex justify-center mb-3">{achievement.icon}</div>
              <h3 className="font-bold text-[#0d5c75] dark:text-[#0d5c75] mb-2 text-sm md:text-base font-poppins">
                {achievement.title}
              </h3>
              <p className="text-[#0A3A47] dark:text-gray-400 text-xs md:text-sm font-open-sans">
                {achievement.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
