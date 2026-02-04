import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Landing = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    // Redirect to register page with email pre-filled
    navigate(`/register?email=${encodeURIComponent(email)}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-padres-gold rounded-lg flex items-center justify-center">
                <span className="text-padres-brown font-bold text-lg">FC</span>
              </div>
              <span className="text-xl font-bold text-padres-brown">Fleet Compliance</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-padres-brown hover:text-padres-gold transition-colors font-medium"
              >
                Log In
              </Link>
              <Link to="/register" className="btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-padres-brown leading-tight">
                Never miss a{' '}
                <span className="text-padres-gold">Clean Truck Check</span> deadline
              </h1>
              <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                Track your fleet's CARB compliance status with ease. Get automated reminders,
                view test history, and stay ahead of regulations — all in one simple dashboard.
              </p>

              <form onSubmit={handleSignup} className="mt-8 flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="input-field flex-1"
                />
                <button type="submit" className="btn-primary whitespace-nowrap" disabled={loading}>
                  {loading ? 'Creating account...' : 'Start Free'}
                </button>
              </form>

              <p className="mt-4 text-sm text-gray-500">
                Free to start. No credit card required.
              </p>
            </div>

            <div className="relative">
              <div className="bg-navy-900 rounded-2xl shadow-2xl p-6 lg:p-8">
                {/* Mock Dashboard Preview */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-padres-gold rounded-lg"></div>
                    <div className="h-4 bg-gray-700 rounded w-32"></div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-green-500/20 rounded-lg p-4">
                      <div className="text-green-400 text-2xl font-bold">12</div>
                      <div className="text-green-400/70 text-xs">Compliant</div>
                    </div>
                    <div className="bg-yellow-500/20 rounded-lg p-4">
                      <div className="text-yellow-400 text-2xl font-bold">4</div>
                      <div className="text-yellow-400/70 text-xs">Due Soon</div>
                    </div>
                    <div className="bg-red-500/20 rounded-lg p-4">
                      <div className="text-red-400 text-2xl font-bold">1</div>
                      <div className="text-red-400/70 text-xs">Overdue</div>
                    </div>
                  </div>

                  <div className="space-y-2 mt-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-navy-800 rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-gray-700 rounded"></div>
                          <div>
                            <div className="h-3 bg-gray-600 rounded w-16"></div>
                            <div className="h-2 bg-gray-700 rounded w-24 mt-1"></div>
                          </div>
                        </div>
                        <div className={`h-5 w-16 rounded-full ${
                          i === 1 ? 'bg-green-500/30' : i === 2 ? 'bg-yellow-500/30' : 'bg-red-500/30'
                        }`}></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-padres-gold/20 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-padres-brown/10 rounded-full blur-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-padres-brown">
              Everything you need for CARB compliance
            </h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              Simple tools to keep your fleet compliant with California's Clean Truck Check program.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                ),
                title: 'Track All Your Trucks',
                description: 'Keep all your fleet data in one place. View status, test history, and compliance at a glance.',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                ),
                title: 'Automated Reminders',
                description: 'Get notified 30, 14, and 3 days before tests are due. Never miss a deadline again.',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ),
                title: '2027 Ready',
                description: 'Toggle between semi-annual and quarterly testing schedules to prepare for the 2027 rule change.',
              },
            ].map((feature, i) => (
              <div key={i} className="card text-center">
                <div className="w-16 h-16 bg-padres-gold/10 rounded-2xl flex items-center justify-center mx-auto text-padres-gold mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-padres-brown mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-padres-brown">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to simplify fleet compliance?
          </h2>
          <p className="text-gray-300 mb-8">
            Join fleet operators who are staying ahead of CARB regulations.
          </p>
          <Link to="/register" className="btn-primary text-lg px-8 py-3">
            Get Started for Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-padres-gold rounded-lg flex items-center justify-center">
                <span className="text-padres-brown font-bold text-sm">FC</span>
              </div>
              <span className="text-padres-brown font-semibold">Fleet Compliance</span>
            </div>
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Fleet Compliance Tracker. Built for San Diego fleets.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
