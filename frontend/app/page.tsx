import Link from "next/link";
import {
  BookOpen, Headphones, PenTool, Brain, Library,
  BarChart2, CheckCircle2, ArrowRight, Send, Mail,
  Shield, Zap,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">IELTS Master</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Features</Link>
            <Link href="#pricing"  className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Pricing</Link>
            <Link href="#contact"  className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Contact</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login"    className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">Log in</Link>
            <Link href="/register" className="text-sm font-semibold bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors shadow-sm">
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow">

        {/* ── HERO ── */}
        <section className="py-24 md:py-32 bg-gradient-to-b from-blue-50 to-white">
          <div className="max-w-4xl mx-auto px-6 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 text-primary text-sm font-medium mb-8">
              <span className="w-2 h-2 rounded-full bg-primary inline-block" />
              Trusted by IELTS candidates in Uzbekistan
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6 leading-tight">
              Master the <span className="text-primary">CD IELTS</span> with Realistic Practice
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mb-10 leading-relaxed">
              Cambridge-based reading, listening, writing and vocabulary practice — built by a real British Council IELTS invigilator.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
              <Link href="/register" className="w-full sm:w-auto px-8 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors shadow-md flex items-center justify-center gap-2">
                Get Started Free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="#pricing" className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center">
                View Pricing
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-8">
              {([
                [Library, "Cambridge Books 1–19"],
                [Shield,  "Real Exam Format"],
                [Zap,     "Instant Band Scores"],
              ] as const).map(([Icon, text]) => (
                <div key={text} className="flex items-center gap-2 text-gray-600 text-sm font-medium">
                  <Icon className="w-4 h-4 text-primary" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Everything you need to achieve your target band.
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {([
                [BookOpen,   "Reading Practice",     "All Cambridge passage types with full 40-question tests and instant band score feedback."],
                [Headphones, "Listening Practice",   "Adjustable audio volume and real exam interface across all four sections."],
                [PenTool,    "Writing Tasks 1 & 2",  "Timed writing environment with word count tracking and Band 8+ model answers."],
                [Brain,      "Vocabulary Builder",   "Topic-based word lists drawn directly from Cambridge IELTS books."],
                [Library,    "Cambridge Books 1–19", "Every test from every Cambridge book, organised and ready to practise."],
                [BarChart2,  "Instant Band Scores",  "Accurate IELTS band scores calculated immediately after every Reading and Listening test."],
              ] as const).map(([Icon, title, desc]) => (
                <div key={title} className="p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="w-12 h-12 bg-blue-50 text-primary rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-white transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section id="pricing" className="py-24 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Simple, transparent pricing.</h2>
              <p className="text-lg text-gray-600">All prices in Uzbek soum. Cancel anytime.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 items-start">

              {/* Free */}
              <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 mb-1">Free</h3>
                <p className="text-gray-500 text-sm mb-6">Forever free</p>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-gray-900">0 so&apos;m</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    "Cambridge books 1–3 only (12 tests)",
                    "Reading & Listening practice",
                    "Instant band score",
                    "No credit card required",
                  ].map(f => (
                    <li key={f} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-gray-600 text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="block w-full py-3 text-center font-semibold rounded-xl border border-primary text-primary hover:bg-blue-50 transition-colors">
                  Get Started Free
                </Link>
              </div>

              {/* Pro */}
              <div className="bg-primary rounded-3xl shadow-xl shadow-blue-900/20 p-8 flex flex-col relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className="bg-amber-400 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow">
                    Most Popular
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">Pro</h3>
                <p className="text-blue-200 text-sm mb-6">Full access to all modules</p>
                <div className="mb-1">
                  <span className="text-4xl font-extrabold text-white">45,000 so&apos;m</span>
                  <span className="text-blue-200 text-sm"> / month</span>
                </div>
                <p className="text-blue-200 text-xs mb-6">or 100,000 so&apos;m for 3 months (save 35,000 so&apos;m)</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    "All Cambridge books 1–19",
                    "All modules (Reading, Listening, Writing, Speaking, Vocabulary)",
                    "Band 8+ sample answers",
                    "Unlimited practice tests",
                    "Priority support",
                  ].map(f => (
                    <li key={f} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-blue-200 shrink-0 mt-0.5" />
                      <span className="text-white text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="block w-full py-3 text-center font-semibold rounded-xl bg-white text-primary hover:bg-gray-50 transition-colors shadow-sm">
                  Start 7-Day Free Trial
                </Link>
              </div>

              {/* Learning Centre */}
              <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 mb-1">Learning Centre</h3>
                <p className="text-gray-500 text-sm mb-6">For schools &amp; academies</p>
                <div className="mb-1">
                  <span className="text-4xl font-extrabold text-gray-900">30,000 so&apos;m</span>
                  <span className="text-gray-500 text-sm"> / student / month</span>
                </div>
                <p className="text-gray-400 text-xs mb-6">or 70,000 so&apos;m for 3 months (save 20,000 so&apos;m)</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    "Everything in Pro",
                    "Bulk student accounts",
                    "Progress tracking per student",
                    "Dedicated support",
                    "Partnership certificate",
                  ].map(f => (
                    <li key={f} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-gray-600 text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="mailto:sardorbeksafarboyev.04@gmail.com"
                  className="block w-full py-3 text-center font-semibold rounded-xl border border-primary text-primary hover:bg-blue-50 transition-colors"
                >
                  Contact for Partnership
                </a>
              </div>

            </div>
          </div>
        </section>

        {/* ── PARTNERSHIP ── */}
        <section id="partnership" className="py-24 bg-white">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Own a learning centre?</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Join our growing network of partner learning centres across Uzbekistan. Get discounted rates, student progress tracking, and a dedicated support line.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6 mb-10">
              <a
                href="mailto:sardorbeksafarboyev.04@gmail.com"
                className="flex items-center gap-4 p-6 rounded-2xl border border-gray-200 hover:border-primary hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-primary transition-colors shrink-0">
                  <Mail className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Email us</p>
                  <p className="text-sm text-primary">sardorbeksafarboyev.04@gmail.com</p>
                </div>
              </a>
              <a
                href="https://t.me/zsafarboyev04"
                className="flex items-center gap-4 p-6 rounded-2xl border border-gray-200 hover:border-primary hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-primary transition-colors shrink-0">
                  <Send className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Telegram</p>
                  <p className="text-sm text-primary">@zsafarboyev04</p>
                </div>
              </a>
            </div>
            <ul className="grid sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
              {[
                "Discounted per-student pricing",
                "Co-branded certificates",
                "Priority feature requests",
                "Dedicated account manager",
              ].map(item => (
                <li key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── CONTACT ── */}
        <section id="contact" className="py-24 bg-gray-50">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Get in touch</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <a
                href="https://t.me/master_ielts_official"
                className="p-6 rounded-2xl bg-white border border-gray-200 hover:border-primary hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary transition-colors">
                  <Send className="w-5 h-5 text-primary group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Telegram Channel</h3>
                <p className="text-sm text-primary mb-2">t.me/master_ielts_official</p>
                <p className="text-sm text-gray-500">Join for tips, updates and free resources</p>
              </a>
              <a
                href="mailto:sardorbeksafarboyev.04@gmail.com"
                className="p-6 rounded-2xl bg-white border border-gray-200 hover:border-primary hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary transition-colors">
                  <Mail className="w-5 h-5 text-primary group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Partnership enquiries</h3>
                <p className="text-sm text-primary mb-2">sardorbeksafarboyev.04@gmail.com</p>
                <p className="text-sm text-gray-500">For learning centres and bulk accounts</p>
              </a>
              <a
                href="https://t.me/zsafarboyev04"
                className="p-6 rounded-2xl bg-white border border-gray-200 hover:border-primary hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary transition-colors">
                  <Send className="w-5 h-5 text-primary group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Technical support</h3>
                <p className="text-sm text-primary mb-2">@zsafarboyev04 on Telegram</p>
                <p className="text-sm text-gray-500">Bug reports and account issues</p>
              </a>
            </div>
            {/* AI chat widget will be injected here */}
            <div id="ai-chat-widget" />
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-8 items-start">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-6 h-6 text-primary-light" />
              <span className="text-xl font-bold text-white">IELTS Master</span>
            </div>
            <p className="text-sm leading-relaxed">Built by a British Council IELTS invigilator.</p>
          </div>
          <nav className="flex flex-wrap justify-center gap-x-8 gap-y-3">
            <Link href="#features" className="text-sm hover:text-white transition-colors">Features</Link>
            <Link href="#pricing"  className="text-sm hover:text-white transition-colors">Pricing</Link>
            <Link href="#contact"  className="text-sm hover:text-white transition-colors">Contact</Link>
            <Link href="/login"    className="text-sm hover:text-white transition-colors">Log in</Link>
          </nav>
          <div className="flex justify-end">
            <a
              href="https://t.me/master_ielts_official"
              aria-label="Telegram channel"
              className="w-10 h-10 bg-gray-800 hover:bg-primary rounded-lg flex items-center justify-center transition-colors"
            >
              <Send className="w-5 h-5 text-gray-300" />
            </a>
          </div>
        </div>
        <div className="border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-6 py-4 text-center text-sm text-gray-500">
            © 2026 IELTS Master. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
