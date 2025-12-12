import React, { useEffect, useState } from 'react';
import { ArrowRight, Check, Users, BarChart3, Zap, Shield, TrendingUp, Star, ChevronDown } from 'lucide-react';

interface LandingProps {
  onGetStarted: () => void;
}

const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden transition-all hover:shadow-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex justify-between items-center text-left hover:bg-slate-50 transition-colors"
      >
        <span className="text-lg font-semibold text-slate-900">{question}</span>
        <ChevronDown
          className={`w-5 h-5 text-slate-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="px-6 pb-6 text-slate-600 animate-fadeIn">{answer}</div>
      )}
    </div>
  );
};

export const Landing: React.FC<LandingProps> = ({ onGetStarted }) => {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    { icon: Users, title: 'Lead Management', desc: 'Track and manage all your leads in one place' },
    { icon: BarChart3, title: 'Pipeline Analytics', desc: 'Visualize your sales pipeline with real-time insights' },
    { icon: Zap, title: 'Real-time Updates', desc: 'Get instant notifications on lead activities' },
    { icon: Shield, title: 'Secure & Private', desc: 'Your data is encrypted and secure' },
    { icon: TrendingUp, title: 'Performance Metrics', desc: 'Track KPIs and revenue trends' },
    { icon: Check, title: 'Easy Integration', desc: 'Works seamlessly with your workflow' },
  ];

  const testimonials = [
    { name: 'Sarah Chen', role: 'Sales Director', company: 'TechCorp', quote: 'Trace CRM transformed how we manage leads. Our conversion rate increased by 40%.', avatar: 'SC' },
    { name: 'Michael Rodriguez', role: 'Founder', company: 'StartupXYZ', quote: 'The real-time pipeline view helps us make data-driven decisions instantly.', avatar: 'MR' },
    { name: 'Emily Johnson', role: 'Marketing Lead', company: 'GrowthCo', quote: 'Best CRM tool we\'ve used. Clean interface and powerful features.', avatar: 'EJ' },
  ];

  const plans = [
    { name: 'Starter', price: 'Free', period: 'forever', features: ['Up to 100 leads', 'Basic pipeline view', 'Email support', 'Mobile access'], popular: false },
    { name: 'Professional', price: '$29', period: 'month', features: ['Unlimited leads', 'Advanced analytics', 'Priority support', 'Custom fields', 'API access'], popular: true },
    { name: 'Enterprise', price: 'Custom', period: '', features: ['Everything in Pro', 'Dedicated support', 'Custom integrations', 'Advanced security', 'Team collaboration'], popular: false },
  ];

  const faqs = [
    { q: 'How does Trace CRM help sales teams?', a: 'Trace CRM provides real-time pipeline visibility, lead tracking, and performance metrics to help sales teams close more deals faster.' },
    { q: 'Is my data secure?', a: 'Yes, we use Firebase with enterprise-grade security. All data is encrypted and stored securely in the cloud.' },
    { q: 'Can I integrate with other tools?', a: 'Yes, Trace CRM offers API access for custom integrations with your existing tools and workflows.' },
    { q: 'Do you offer mobile access?', a: 'Yes, Trace CRM is fully responsive and works seamlessly on mobile devices and tablets.' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white text-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/85 backdrop-blur-md border-b border-slate-200 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <img src="https://i.postimg.cc/QC67xcXT/T-logo.png" alt="Trace" className="w-8 h-8" />
              <span className="text-lg font-semibold text-slate-900">Trace CRM</span>
            </div>
            <button
              onClick={onGetStarted}
              className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-black transition-all transform hover:scale-105"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight">
              Manage Your Sales Pipeline
              <span className="block text-slate-600 mt-2">Like Never Before</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-3xl mx-auto">
              Real-time CRM platform that helps you track leads, visualize pipelines, and boost conversions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={onGetStarted}
                className="group px-8 py-4 bg-slate-900 text-white text-lg font-semibold rounded-xl hover:bg-black transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 border-2 border-slate-300 text-slate-700 text-lg font-semibold rounded-xl hover:border-slate-400 transition-all">
                Watch Demo
              </button>
            </div>
          </div>

          {/* Animated Dashboard Preview */}
          <div className={`mt-20 relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
            <div className="relative bg-white rounded-2xl shadow-2xl p-6 border border-slate-200 transform hover:scale-[1.02] transition-transform duration-300">
              <div className="bg-slate-50 rounded-lg p-8 min-h-[380px] flex items-center justify-center">
                <div className="text-center text-slate-600">
                  <svg width="520" height="240" viewBox="0 0 520 240" className="mx-auto text-slate-300">
                    <rect x="10" y="10" width="500" height="60" rx="8" className="fill-none stroke-current" strokeWidth="2" />
                    <rect x="10" y="90" width="320" height="50" rx="8" className="fill-none stroke-current" strokeWidth="2" />
                    <rect x="340" y="90" width="170" height="50" rx="8" className="fill-none stroke-current" strokeWidth="2" />
                    <rect x="10" y="160" width="200" height="50" rx="8" className="fill-none stroke-current" strokeWidth="2" />
                    <rect x="220" y="160" width="140" height="50" rx="8" className="fill-none stroke-current" strokeWidth="2" />
                    <rect x="370" y="160" width="140" height="50" rx="8" className="fill-none stroke-current" strokeWidth="2" />
                    <line x1="40" y1="40" x2="160" y2="40" className="stroke-current" strokeWidth="3" />
                    <line x1="200" y1="40" x2="300" y2="40" className="stroke-current" strokeWidth="3" />
                    <line x1="40" y1="120" x2="250" y2="120" className="stroke-current" strokeWidth="3" />
                    <line x1="360" y1="120" x2="470" y2="120" className="stroke-current" strokeWidth="3" />
                    <line x1="40" y1="190" x2="170" y2="190" className="stroke-current" strokeWidth="3" />
                    <line x1="240" y1="190" x2="330" y2="190" className="stroke-current" strokeWidth="3" />
                    <line x1="390" y1="190" x2="490" y2="190" className="stroke-current" strokeWidth="3" />
                  </svg>
                  <p className="text-slate-500 text-lg mt-6">Preview of your Trace CRM dashboard</p>
                </div>
              </div>
            </div>
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-slate-300 rounded-full opacity-20 blur-xl animate-pulse-slow"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-slate-200 rounded-full opacity-30 blur-xl animate-pulse-slow"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Powerful features designed to help you manage leads and close deals faster.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="group p-6 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-slate-600">Choose the plan that works for you</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, idx) => (
              <div
                key={idx}
                className={`relative p-8 bg-white rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                  plan.popular
                    ? 'border-slate-900 shadow-2xl scale-105'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-slate-900 text-white text-xs font-semibold rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                  {plan.period && <span className="text-slate-600 ml-2">/{plan.period}</span>}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={onGetStarted}
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    plan.popular
                      ? 'bg-slate-900 text-white hover:bg-black'
                      : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Trusted by Sales Teams
            </h2>
            <p className="text-xl text-slate-600">See what our customers are saying</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="p-6 bg-slate-50 rounded-xl border border-slate-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-slate-300 text-slate-300" />
                  ))}
                </div>
                <p className="text-slate-700 mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{testimonial.name}</p>
                    <p className="text-sm text-slate-600">{testimonial.role}, {testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <FAQItem key={idx} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Sales Process?
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Join thousands of sales teams using Trace CRM to close more deals.
          </p>
          <button
            onClick={onGetStarted}
            className="px-8 py-4 bg-white text-slate-900 text-lg font-semibold rounded-xl hover:bg-slate-100 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 mx-auto"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <img src="https://i.postimg.cc/QC67xcXT/T-logo.png" alt="Trace" className="w-6 h-6" />
              <span className="text-white font-semibold">Trace CRM</span>
            </div>
            <p className="text-sm">© 2024 Trace CRM. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

