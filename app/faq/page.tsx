"use client"

import React, { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Search,
  X,
  ChevronDown,
  ArrowLeft,
  Calendar,
  Phone,
  MessageCircle,
  HelpCircle,
  Activity,
  ShieldCheck,
  Building2,
  CalendarDays,
  Sparkles,
  ArrowUp,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  MapPin,
  ExternalLink,
  Share2,
  BookOpen
} from "lucide-react"
import { quickQuestions, FAQ_CATEGORIES, FAQItem, QuickCategory, DetailSection } from "@/lib/faq-data"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LanguageProvider, useLanguage } from "@/components/language-provider"
import { LanguageToggle } from "@/components/language-toggle"
import { ThemeToggle } from "@/components/theme-toggle"
import { AppointmentBookingModal } from "@/components/appointment-booking-modal"

function FAQPageContent() {
  const { language } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<"all" | QuickCategory>("all")
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(["gonstead"]))
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const isUr = language === "ur"

  // Show scroll-to-top button when scrolled down
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Support direct anchor linking via hash in URL (e.g. /faq#sciatica)
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const hashId = window.location.hash.replace("#", "")
      if (quickQuestions.some((q) => q.id === hashId)) {
        setExpandedIds((prev) => new Set([...prev, hashId]))
        setTimeout(() => {
          const el = document.getElementById(hashId)
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" })
          }
        }, 300)
      }
    }
  }, [])

  // Filter questions based on category and live search query
  const filteredQuestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return quickQuestions.filter((item) => {
      // Category match
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false
      }
      // Search match
      if (!q) return true

      const labelEn = item.label.toLowerCase()
      const labelUr = (item.labelUr || "").toLowerCase()
      const answerEn = item.answer.toLowerCase()
      const answerUr = (item.answerUr || "").toLowerCase()

      if (labelEn.includes(q) || labelUr.includes(q) || answerEn.includes(q) || answerUr.includes(q)) {
        return true
      }

      // Match within sections
      if (item.sections && item.sections.length > 0) {
        return item.sections.some((sec) => {
          const secTitle = sec.title.toLowerCase()
          const secTitleUr = (sec.titleUr || "").toLowerCase()
          const itemsText = sec.items.join(" ").toLowerCase()
          const itemsTextUr = (sec.itemsUr || []).join(" ").toLowerCase()
          return (
            secTitle.includes(q) ||
            secTitleUr.includes(q) ||
            itemsText.includes(q) ||
            itemsTextUr.includes(q)
          )
        })
      }

      return false
    })
  }, [searchQuery, selectedCategory])

  // Count items per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: quickQuestions.length }
    for (const item of quickQuestions) {
      counts[item.category] = (counts[item.category] || 0) + 1
    }
    return counts
  }, [])

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const expandAll = () => {
    setExpandedIds(new Set(filteredQuestions.map((q) => q.id)))
  }

  const collapseAll = () => {
    setExpandedIds(new Set())
  }

  const handleShareQuestion = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/faq#${id}`
      navigator.clipboard?.writeText(url)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  // Get icon for category badge
  const getCategoryIcon = (category: QuickCategory) => {
    switch (category) {
      case "treatment":
        return <Activity className="h-3.5 w-3.5" />
      case "conditions":
        return <ShieldCheck className="h-3.5 w-3.5" />
      case "clinic":
        return <Building2 className="h-3.5 w-3.5" />
      case "booking":
        return <CalendarDays className="h-3.5 w-3.5" />
      default:
        return <HelpCircle className="h-3.5 w-3.5" />
    }
  }

  const getCategoryName = (category: QuickCategory) => {
    switch (category) {
      case "treatment":
        return isUr ? "گونسٹیڈ اور علاج" : "Treatment"
      case "conditions":
        return isUr ? "ریڑھ کی ہڈی اور تکالیف" : "Conditions"
      case "clinic":
        return isUr ? "کلینک اور اوقات" : "Clinic"
      case "booking":
        return isUr ? "بکنگ اور وزٹ" : "Booking"
      default:
        return category
    }
  }

  return (
    <div className={`min-h-screen bg-[#F8F5F0] dark:bg-slate-950 text-slate-800 dark:text-slate-100 ${isUr ? "font-sans" : ""}`}>
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-[rgb(70,146,138)] dark:bg-[rgb(50,116,108)] text-white shadow-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm transition-all duration-200 border border-white/20"
              aria-label="Back to Homepage"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{isUr ? "مرکزی صفحہ" : "Home"}</span>
            </Link>

            <div className="hidden sm:flex items-center gap-2 border-l border-white/20 pl-3">
              <Image
                src="/images/gonstead-logo-new.png"
                alt="Gonstead Chiropractic Logo"
                width={36}
                height={36}
                className="object-contain w-8 h-8"
              />
              <span className="font-bold text-sm tracking-wide text-white">
                GONSTEAD CLINIC
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="/educational-guide.html"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm transition-all duration-200 border border-white/20"
            >
              <BookOpen className="h-4 w-4" />
              <span>{isUr ? "تعلیمی گائیڈ" : "Education Hub"}</span>
            </a>
            <div className="flex items-center bg-white/10 rounded-md px-1.5 py-1">
              <ThemeToggle />
            </div>
            <div className="flex items-center bg-white/10 rounded-md px-1.5 py-1">
              <LanguageToggle />
            </div>
            <AppointmentBookingModal
              buttonText={isUr ? "ملاقات بک کریں" : "Book Appointment"}
              className="bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] hover:from-[#0a4a5c] hover:to-[#1e7a6b] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-md font-semibold text-xs sm:text-sm shadow-md transition-all"
            />
          </div>
        </div>
      </header>

      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[rgb(70,146,138)]/15 via-[#E0F2F1]/30 to-transparent dark:from-cyan-950/30 dark:via-transparent pt-8 sm:pt-14 pb-10 sm:pb-16 border-b border-slate-200/60 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-4 bg-[#0d5c75]/10 text-[#0d5c75] dark:bg-cyan-500/20 dark:text-cyan-300 border border-[#0d5c75]/25 px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 mr-1.5 inline" />
            {isUr ? "جامع مریضوں کی رہنمائی" : "Patient Knowledge Base"}
          </Badge>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#0A3A47] dark:text-white mb-3 sm:mb-4">
            {isUr ? "اکثر پوچھے جانے والے سوالات" : "Frequently Asked Questions"}
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6 sm:mb-8">
            {isUr
              ? "گونسٹیڈ تکنیک، کلینک کے اوقات، علامات، بکنگ کے طریقہ کار اور علاج کے بعد دیکھ بھال کے بارے میں مکمل معلومات۔"
              : "Clear, evidence-based answers about the Gonstead chiropractic method, conditions treated, what to expect on your first visit, and clinic procedures in Nowshera."}
          </p>

          {/* Search Box */}
          <div className="max-w-2xl mx-auto relative shadow-lg rounded-2xl">
            <div className="relative flex items-center">
              <Search className="absolute left-4 h-5 w-5 text-slate-400 dark:text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isUr
                    ? "سوال تلاش کریں (مثلاً: سائیٹکا، ایکسرے، فیس، اوقات)..."
                    : "Search questions (e.g. sciatica, X-rays, first visit, fees, hours)..."
                }
                className="w-full pl-12 pr-12 py-3.5 sm:py-4 bg-white dark:bg-slate-900 border-2 border-[#0d5c75]/30 dark:border-cyan-500/30 rounded-2xl text-sm sm:text-base text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#0d5c75] dark:focus:border-cyan-400 focus:ring-4 focus:ring-[#0d5c75]/10 dark:focus:ring-cyan-500/20 transition-all shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Popular Topics */}
          <div className="max-w-2xl mx-auto mt-4 flex items-center justify-center flex-wrap gap-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              {isUr ? "عام موضوعات:" : "Popular:"}
            </span>
            {[
              { en: "Sciatica", ur: "سائیٹکا" },
              { en: "First Visit", ur: "پہلی وزٹ" },
              { en: "X-Rays", ur: "ایکس رے" },
              { en: "Clinic Hours", ur: "اوقات" },
              { en: "Fees", ur: "فیس" },
            ].map((topic) => (
              <button
                key={topic.en}
                type="button"
                onClick={() => setSearchQuery(isUr ? topic.ur : topic.en)}
                className="px-2.5 py-1 rounded-full bg-white/70 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
              >
                {isUr ? topic.ur : topic.en}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Category Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-none w-full sm:w-auto">
            {FAQ_CATEGORIES.map((cat) => {
              const count = categoryCounts[cat.id] ?? 0
              const isActive = selectedCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 border ${
                    isActive
                      ? "bg-[#0d5c75] text-white border-[#0d5c75] shadow-md shadow-[#0d5c75]/20 scale-[1.02]"
                      : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <span>{isUr ? cat.labelUr : cat.labelEn}</span>
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] sm:text-xs ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Quick Expand / Collapse controls */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 ml-auto">
            <span>
              {isUr
                ? `${filteredQuestions.length} سوالات دستیاب`
                : `${filteredQuestions.length} of ${quickQuestions.length} questions`}
            </span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <button
              onClick={expandAll}
              className="text-[#0d5c75] dark:text-cyan-400 hover:underline"
            >
              {isUr ? "تمام کھولیں" : "Expand All"}
            </button>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <button
              onClick={collapseAll}
              className="text-[#0d5c75] dark:text-cyan-400 hover:underline"
            >
              {isUr ? "تمام بند کریں" : "Collapse All"}
            </button>
          </div>
        </div>

        {/* Empty Search State */}
        {filteredQuestions.length === 0 && (
          <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm my-6">
            <HelpCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
              {isUr ? "کوئی سوال نہیں ملا" : "No matching questions found"}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
              {isUr
                ? "آپ کی تلاش سے ملتا جلتا سوال نہیں ملا۔ براہ کرم الفاظ تبدیل کریں یا کلینک کے عملے سے براہ راست رابطہ کریں۔"
                : `We couldn't find any questions matching "${searchQuery}". Try a different keyword or contact our team directly.`}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory("all")
                }}
              >
                {isUr ? "فلٹر ختم کریں" : "Clear Search"}
              </Button>
              <a
                href="https://wa.me/923046996267"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                {isUr ? "واٹس ایپ پر پوچھیں" : "Ask on WhatsApp"}
              </a>
            </div>
          </div>
        )}

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {filteredQuestions.map((item) => {
            const isExpanded = expandedIds.has(item.id)
            const title = isUr && item.labelUr ? item.labelUr : item.label
            const answer = isUr && item.answerUr ? item.answerUr : item.answer

            return (
              <div
                key={item.id}
                id={item.id}
                className={`rounded-2xl transition-all duration-200 border bg-white dark:bg-slate-900 shadow-sm ${
                  isExpanded
                    ? "border-[#0d5c75]/50 dark:border-cyan-500/50 ring-2 ring-[#0d5c75]/10 dark:ring-cyan-500/10 shadow-md"
                    : "border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                {/* Accordion Question Header */}
                <button
                  type="button"
                  onClick={() => toggleExpand(item.id)}
                  aria-expanded={isExpanded}
                  className="w-full text-left p-4 sm:p-5 flex items-start sm:items-center justify-between gap-3 rounded-2xl select-none"
                >
                  <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                    <Badge
                      variant="outline"
                      className="hidden sm:inline-flex items-center gap-1 shrink-0 px-2 py-0.5 text-[11px] font-medium border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                      {getCategoryIcon(item.category)}
                      <span>{getCategoryName(item.category)}</span>
                    </Badge>
                    <span className="font-bold text-sm sm:text-base md:text-lg text-slate-800 dark:text-slate-100 leading-snug">
                      {title}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleShareQuestion(e, item.id)}
                      className="p-1.5 text-slate-400 hover:text-[#0d5c75] dark:hover:text-cyan-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title={copiedId === item.id ? "Link copied!" : "Copy question link"}
                      aria-label="Copy question link"
                    >
                      {copiedId === item.id ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Share2 className="h-4 w-4" />
                      )}
                    </button>
                    <div
                      className={`p-1.5 rounded-lg text-slate-400 dark:text-slate-500 transition-transform duration-200 ${
                        isExpanded ? "rotate-180 text-[#0d5c75] dark:text-cyan-400 bg-slate-100 dark:bg-slate-800" : ""
                      }`}
                    >
                      <ChevronDown className="h-5 w-5" />
                    </div>
                  </div>
                </button>

                {/* Accordion Expanded Body */}
                {isExpanded && (
                  <div className="px-4 pb-5 sm:px-6 sm:pb-6 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                    {/* Primary Answer Block */}
                    <div className="bg-[#E0F2F1]/30 dark:bg-cyan-950/20 border-l-4 border-[#0d5c75] dark:border-cyan-400 p-4 rounded-r-xl my-3">
                      <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                        {answer}
                      </p>
                    </div>

                    {/* Detailed Subsections (if present) */}
                    {item.sections && item.sections.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-4">
                        {item.sections.map((sec, sIdx) => {
                          const secTitle = isUr && sec.titleUr ? sec.titleUr : sec.title
                          const itemsList = isUr && sec.itemsUr && sec.itemsUr.length > 0 ? sec.itemsUr : sec.items
                          const isWarning =
                            sec.title.toLowerCase().includes("warning") ||
                            sec.title.toLowerCase().includes("red flag") ||
                            sec.title.toLowerCase().includes("urgent") ||
                            sec.title.toLowerCase().includes("prohibited")

                          return (
                            <div
                              key={sIdx}
                              className={`rounded-xl p-3.5 border ${
                                isWarning
                                  ? "bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50"
                                  : "bg-slate-50/80 dark:bg-slate-800/50 border-slate-200/70 dark:border-slate-800"
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-2 font-semibold text-xs sm:text-sm">
                                {isWarning ? (
                                  <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" />
                                ) : (
                                  <Info className="h-4 w-4 text-[#0d5c75] dark:text-cyan-400 shrink-0" />
                                )}
                                <span
                                  className={
                                    isWarning
                                      ? "text-rose-700 dark:text-rose-300"
                                      : "text-slate-800 dark:text-slate-200"
                                  }
                                >
                                  {secTitle}
                                </span>
                              </div>
                              <ul className="space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                                {itemsList.map((line, lIdx) => (
                                  <li key={lIdx} className="flex items-start gap-2">
                                    <span
                                      className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${
                                        isWarning
                                          ? "bg-rose-500"
                                          : "bg-[#0d5c75] dark:bg-cyan-400"
                                      }`}
                                    />
                                    <span className="leading-relaxed">{line}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Bottom Quick Action Footer */}
                    <div className="mt-4 pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <span className="text-slate-400 dark:text-slate-500">
                        Reference: #{item.id}
                      </span>
                      <div className="flex items-center gap-2">
                        <a
                          href={`https://wa.me/923046996267?text=Hello%20Dr.%20Bashir,%20I%20have%20a%20question%20regarding%20${encodeURIComponent(
                            item.label
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 font-medium transition-colors"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          <span>{isUr ? "واٹس ایپ رہنمائی" : "WhatsApp Inquiry"}</span>
                        </a>
                        <AppointmentBookingModal
                          buttonText={isUr ? "بک کریں" : "Book This Care"}
                          buttonSize="sm"
                          className="h-7 text-xs px-2.5 py-0 bg-[#0d5c75] hover:bg-[#0a4a5c] text-white rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Still Have Questions CTA Card */}
        <section className="mt-12 sm:mt-16 bg-gradient-to-br from-[#0d5c75] to-[#2a9d8f] text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <Badge className="bg-white/20 text-white border-white/30 text-xs mb-3 px-3 py-0.5 rounded-full">
              {isUr ? "براہ راست ڈاکٹر سے رابطہ" : "Personalized Consultation"}
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
              {isUr ? "مزید سوالات ہیں؟ ہم مدد کے لیے حاضر ہیں" : "Still Have Questions About Your Condition?"}
            </h2>
            <p className="text-sm sm:text-base text-cyan-50/90 leading-relaxed mb-6">
              {isUr
                ? "ہر مریض کی حالت منفرد ہوتی ہے۔ ڈاکٹر بشیر خان سے اپنے ایکسرے، ایم آر آئی، یا مخصوص درد کے بارے میں رہنمائی حاصل کریں۔"
                : "Every spine is unique. If your specific symptom or concern isn't covered here, our clinical team is available via direct phone or WhatsApp consultation."}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="https://wa.me/923046996267?text=Hello%20Dr.%20Bashir,%20I%20would%20like%20to%20inquire%20about%20Gonstead%20chiropractic%20care."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp: +92 304 699 6267</span>
              </a>

              <a
                href="tel:+923046996267"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-sm transition-all border border-white/20"
              >
                <Phone className="h-4 w-4" />
                <span>Call Clinic</span>
              </a>

              <AppointmentBookingModal
                buttonText={isUr ? "آن لائن بکنگ" : "Book Online"}
                className="px-4 py-2.5 rounded-xl bg-white text-[#0d5c75] hover:bg-slate-100 font-semibold text-sm transition-all shadow-md"
              />
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/15 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-cyan-100">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0 text-cyan-200" />
              <span>Mon - Sat: 9:00 AM - 6:00 PM</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-cyan-200" />
              <span>Tehsil Road, Nowshera, KPK</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 shrink-0 text-cyan-200" />
              <span>Gonstead Certified Level V</span>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-30 p-3 rounded-full bg-[#0d5c75] text-white shadow-lg hover:bg-[#0a4a5c] transition-all duration-300 hover:scale-110 border border-white/20"
          aria-label="Scroll back to top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}

      {/* Footer */}
      <footer className="mt-16 bg-slate-900 text-slate-400 py-8 border-t border-slate-800 text-center text-xs">
        <div className="max-w-5xl mx-auto px-4">
          <p>© {new Date().getFullYear()} Gonstead Chiropractic Clinic Nowshera. All rights reserved.</p>
          <p className="mt-2 text-slate-500">
            Certified Gonstead Specialist Level V • Evidence-Based Spinal Care
          </p>
        </div>
      </footer>
    </div>
  )
}

export default function FAQPage() {
  return (
    <LanguageProvider>
      <FAQPageContent />
    </LanguageProvider>
  )
}
