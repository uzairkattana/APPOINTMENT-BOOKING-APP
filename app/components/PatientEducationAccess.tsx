import React from 'react';
import { BookOpen, Award, Clock, Users } from 'lucide-react';

const PatientEducationAccess: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white py-12 px-4 sm:px-6 lg:px-8 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950">
      {/* Sophisticated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-5" style={{backgroundImage: "url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22%3E%3Cdefs%3E%3Cpattern id=%22grid%22 width=%2260%22 height=%2260%22 patternUnits=%22userSpaceOnUse%22%3E%3Cpath d=%22M 60 0 L 0 0 0 60%22 fill=%22none%22 stroke=%22white%22 stroke-width=%221%22/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=%22100%25%22 height=%22100%25%22 fill=%22url(%2523grid)%22/%3E%3C/svg%3E')"}}></div>
      
      {/* Main Content */}
      <div className="relative max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl mr-4 shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-200 to-teal-200 bg-clip-text text-transparent">
                Patient Education Resources
              </h2>
            </div>
            
            <p className="text-lg text-slate-300 mb-6 max-w-2xl leading-relaxed">
              Access our comprehensive educational guide to understand your chiropractic care journey and optimize your healing process.
            </p>
            
            {/* Enhanced Benefits */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-8">
              <div className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 backdrop-blur-sm border border-emerald-500/20 rounded-full px-4 py-2 hover:from-emerald-600/30 hover:to-teal-600/30 transition-all duration-300">
                <Award className="w-4 h-4 text-emerald-300" />
                <span className="text-sm text-emerald-200 font-medium">Expert-Approved</span>
              </div>
              <div className="flex items-center space-x-2 bg-gradient-to-r from-teal-600/20 to-cyan-600/20 backdrop-blur-sm border border-teal-500/20 rounded-full px-4 py-2 hover:from-teal-600/30 hover:to-cyan-600/30 transition-all duration-300">
                <Clock className="w-4 h-4 text-teal-300" />
                <span className="text-sm text-teal-200 font-medium">Always Updated</span>
              </div>
              <div className="flex items-center space-x-2 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 backdrop-blur-sm border border-cyan-500/20 rounded-full px-4 py-2 hover:from-cyan-600/30 hover:to-blue-600/30 transition-all duration-300">
                <Users className="w-4 h-4 text-cyan-300" />
                <span className="text-sm text-cyan-200 font-medium">Easy to Follow</span>
              </div>
            </div>
          </div>
          
          {/* Right CTA */}
          <div className="flex-shrink-0">
            <a
              href="/educational-guide.html"
              className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl 
                       hover:from-emerald-400 hover:to-teal-400 transition-all duration-300 shadow-xl hover:shadow-2xl
                       transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:ring-offset-2 focus:ring-offset-slate-900
                       border border-emerald-400/20 backdrop-blur-sm"
              aria-label="View comprehensive educational guide for chiropractic patients"
            >
              <BookOpen className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-300" />
              <span className="relative">
                View Guide
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white/50 group-hover:w-full transition-all duration-300"></span>
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PatientEducationAccess;
