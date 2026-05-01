import Link from "next/link";
import { CheckCircle2, BookOpen, Headphones, PenTool, Mic, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-primary-dark">IELTS Master</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Features</Link>
            <Link href="#pricing" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Pricing</Link>
            <Link href="#contact" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Contact</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">Log in</Link>
            <Link href="/register" className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors shadow-sm">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-b from-blue-50 to-white">
          <div className="container mx-auto px-4 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-primary text-sm font-medium mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Now with AI-Powered Writing & Speaking Feedback
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight max-w-4xl mb-6 leading-tight">
              Master the <span className="text-primary">CD IELTS</span> with Realistic Practice
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mb-10 leading-relaxed">
              Experience the exact format of the Computer-Delivered IELTS. Get instant band scores, detailed explanations, and AI-driven feedback to achieve your dream score.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link href="/register" className="w-full sm:w-auto px-8 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all transform hover:scale-105 shadow-lg shadow-blue-200 flex items-center justify-center gap-2">
                Start Practicing Free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="#features" className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center">
                Explore Features
              </Link>
            </div>
            
            {/* Mockup Preview */}
            <div className="mt-16 w-full max-w-5xl rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
              <div className="h-8 border-b border-gray-100 bg-gray-50 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="aspect-[16/9] bg-gray-100 relative flex items-center justify-center">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
                <div className="z-10 text-gray-400 flex flex-col items-center">
                  <BookOpen className="w-16 h-16 mb-4 text-primary opacity-50" />
                  <p className="text-lg font-medium text-gray-500">CD IELTS Interface Simulation</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything you need to score 8.0+</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">Our platform replicates the exact CD IELTS environment and uses advanced AI to grade your subjective answers.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Reading */}
              <div className="p-6 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-12 h-12 bg-blue-50 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Reading</h3>
                <p className="text-gray-600 mb-4">Authentic passages with all 14 question types. Highlight text, add notes, and get instant band scores.</p>
              </div>

              {/* Listening */}
              <div className="p-6 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-12 h-12 bg-blue-50 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Headphones className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Listening</h3>
                <p className="text-gray-600 mb-4">Adjustable audio volume, exact exam interface, and instant results with detailed tape scripts.</p>
              </div>

              {/* Writing */}
              <div className="p-6 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-12 h-12 bg-blue-50 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                  <PenTool className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Writing</h3>
                <p className="text-gray-600 mb-4">Practice Task 1 & 2. Get immediate AI feedback on TR, CC, LR, and GRA based on official criteria.</p>
              </div>

              {/* Speaking */}
              <div className="p-6 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-12 h-12 bg-blue-50 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Mic className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Speaking</h3>
                <p className="text-gray-600 mb-4">Record your answers in a simulated environment. Get transcriptions and AI-driven pronunciation feedback.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">Start for free, upgrade when you need AI feedback.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Free Plan */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Free Starter</h3>
                <p className="text-gray-500 mb-6">Perfect for testing the platform.</p>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-gray-900">0 UZS</span>
                  <span className="text-gray-500">/forever</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-600">Unlimited Reading tests</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-600">Unlimited Listening tests</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-600">Basic vocabulary flashcards</span>
                  </li>
                  <li className="flex items-center gap-3 opacity-50">
                    <CheckCircle2 className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-500">AI Writing Feedback</span>
                  </li>
                  <li className="flex items-center gap-3 opacity-50">
                    <CheckCircle2 className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-500">AI Speaking Feedback</span>
                  </li>
                </ul>
                <Link href="/register" className="block w-full py-3 px-4 bg-blue-50 text-primary font-semibold text-center rounded-xl hover:bg-blue-100 transition-colors">
                  Create Free Account
                </Link>
              </div>

              {/* Premium Plan */}
              <div className="bg-primary p-8 rounded-3xl shadow-xl shadow-blue-900/20 text-white relative transform md:-translate-y-4">
                <div className="absolute top-0 right-6 transform -translate-y-1/2">
                  <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    Most Popular
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-2">Premium</h3>
                <p className="text-blue-100 mb-6">Full access to all AI features.</p>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold">50,000 UZS</span>
                  <span className="text-blue-200">/month</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-200 flex-shrink-0" />
                    <span>Everything in Free</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-200 flex-shrink-0" />
                    <span>Detailed AI Writing feedback</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-200 flex-shrink-0" />
                    <span>AI Speaking assessment</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-200 flex-shrink-0" />
                    <span>Advanced vocabulary</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-200 flex-shrink-0" />
                    <span>Detailed performance analytics</span>
                  </li>
                </ul>
                <Link href="/register?plan=premium" className="block w-full py-3 px-4 bg-white text-primary font-semibold text-center rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                  Get Premium
                </Link>
              </div>
            </div>
            
            <div className="mt-12 text-center text-gray-500">
              <p>Are you a Learning Center? <Link href="#contact" className="text-primary font-medium hover:underline">Contact us for bulk pricing</Link></p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="container mx-auto px-4 grid md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-6 h-6 text-primary-light" />
              <span className="text-xl font-bold text-white">IELTS Master</span>
            </div>
            <p className="max-w-md mb-6">The most advanced platform for CD IELTS preparation in Uzbekistan. Combining authentic practice with cutting-edge AI feedback.</p>
            <p className="text-sm">© {new Date().getFullYear()} IELTS Master. All rights reserved.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/reading" className="hover:text-white transition-colors">Reading Tests</Link></li>
              <li><Link href="/listening" className="hover:text-white transition-colors">Listening Tests</Link></li>
              <li><Link href="/writing" className="hover:text-white transition-colors">Writing Tasks</Link></li>
              <li><Link href="/speaking" className="hover:text-white transition-colors">Speaking Practice</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
