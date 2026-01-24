import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Zap, 
  Users, 
  BarChart3, 
  Clock,
  CheckCircle,
  ChevronRight,
  ExternalLink,
  Star,
  TrendingUp,
  Award,
  Globe,
  Lock,
  MessageSquare,
  Calendar,
  ArrowRight,
  Menu,
  X,
  Play,
  Sparkles,
  Send,
  AlertCircle,
  Check
} from 'lucide-react';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    role: '',
    challenges: ''
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.organization) {
      setSubmitError('Please fill in all required fields');
      return;
    }

    if (!formData.email.includes('@')) {
      setSubmitError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch('https://formsubmit.co/ajax/sajansah205@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: `New Demo Request from ${formData.name}`,
          _template: 'table',
          name: formData.name,
          email: formData.email,
          organization: formData.organization,
          role: formData.role,
          challenges: formData.challenges,
          source: 'Evalis Landing Page',
          timestamp: new Date().toISOString()
        })
      });

      const result = await response.json();

      if (result.success) {
        setSubmitSuccess(true);
        setFormData({
          name: '',
          email: '',
          organization: '',
          role: '',
          challenges: ''
        });
        
        setTimeout(() => {
          setSubmitSuccess(false);
        }, 5000);
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitError('Failed to submit form. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleGetStarted = () => {
    navigate('/login');
  };

  const handleRequestDemo = () => {
    document.getElementById('demo-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const features = [
    {
      icon: <Sparkles className="feature-icon" />,
      title: "AI-Powered Grading",
      description: "Save 70% evaluation time with our intelligent scoring system",
      stat: "96.5% Accuracy",
      color: "purple"
    },
    {
      icon: <Shield className="feature-icon" />,
      title: "Bank-Level Security",
      description: "Military-grade encryption & anti-cheating protocols",
      stat: "Zero Breaches",
      color: "blue"
    },
    {
      icon: <Zap className="feature-icon" />,
      title: "Instant Results",
      description: "Real-time processing with detailed analytics",
      stat: "10x Faster",
      color: "green"
    },
    {
      icon: <TrendingUp className="feature-icon" />,
      title: "Smart Analytics",
      description: "Actionable insights with predictive performance metrics",
      stat: "500+ Metrics",
      color: "orange"
    }
  ];

  const userStories = [
    {
      type: "University",
      name: "Stanford University",
      impact: "Reduced grading time by 80%",
      quote: "Evalis transformed how we handle 10,000+ annual exams.",
      color: "blue"
    },
    {
      type: "Corporate",
      name: "TechCorp Inc.",
      impact: "Improved hiring accuracy by 45%",
      quote: "Our technical assessments are now more efficient and reliable.",
      color: "purple"
    },
    {
      type: "Government",
      name: "National Testing Agency",
      impact: "Scaled to 1M+ candidates",
      quote: "Unmatched security and scalability for national-level exams.",
      color: "green"
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      description: "Perfect for small institutions",
      price: "$99",
      period: "/month",
      features: [
        "Up to 1,000 exams/month",
        "Basic AI grading",
        "Standard security",
        "Email support",
        "Basic analytics"
      ],
      cta: "Start Free Trial",
      popular: false
    },
    {
      name: "Professional",
      description: "For growing organizations",
      price: "$299",
      period: "/month",
      features: [
        "Up to 10,000 exams/month",
        "Advanced AI grading",
        "Enhanced security",
        "Priority support",
        "Advanced analytics",
        "Custom branding",
        "API access"
      ],
      cta: "Get Started",
      popular: true
    },
    {
      name: "Enterprise",
      description: "For large-scale deployments",
      price: "Custom",
      period: "",
      features: [
        "Unlimited exams",
        "Full AI suite",
        "Military-grade security",
        "24/7 dedicated support",
        "Predictive analytics",
        "White-label solution",
        "SLA guarantee",
        "Custom integrations"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      role: "Dean of Examinations, MIT",
      image: "👩‍🏫",
      quote: "Evalis reduced our grading workload by 75% while improving accuracy. A game-changer for higher education.",
      rating: 5
    },
    {
      name: "Rajesh Patel",
      role: "CEO, EduTech Solutions",
      image: "👨‍💼",
      quote: "The API integration was seamless. We deployed nationwide exams in just 2 weeks.",
      rating: 5
    },
    {
      name: "Maria Rodriguez",
      role: "Head of HR, Fortune 500",
      image: "👩‍💼",
      quote: "Our hiring process is now 3x faster with Evalis. The analytics help us make better hiring decisions.",
      rating: 5
    }
  ];

  return (
    <div className="startup-landing">
      {/* Navigation */}
      <nav className={`startup-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <div className="nav-brand">
            <div className="logo">
              <Sparkles className="logo-icon" />
              <span className="logo-text">Evalis</span>
            </div>
            <span className="logo-tagline">Intelligent Assessment</span>
          </div>

          <div className="nav-menu">
            <button 
              className="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className={`nav-links ${isMobileMenuOpen ? 'open' : ''}`}>
              <a href="#features" onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); setIsMobileMenuOpen(false); }}>Features</a>
              <a href="#solutions" onClick={(e) => { e.preventDefault(); document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' }); setIsMobileMenuOpen(false); }}>Solutions</a>
              <a href="#pricing" onClick={(e) => { e.preventDefault(); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); setIsMobileMenuOpen(false); }}>Pricing</a>
              <a href="#testimonials" onClick={(e) => { e.preventDefault(); document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' }); setIsMobileMenuOpen(false); }}>Testimonials</a>
              <button className="nav-cta-secondary" onClick={handleRequestDemo}>
                Request Demo
              </button>
              <button className="nav-cta-primary" onClick={handleLogin}>
                <span>Login</span>
                <ArrowRight size={16} />
              </button>
              <a href="/superadmin/login" className="nav-superadmin-link">
                <span>SuperAdmin</span>
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="gradient-blob"></div>
          <div className="pattern"></div>
        </div>
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span>AI-Powered Platform</span>
              <div className="badge-dot"></div>
            </div>
            <h1 className="hero-title">
              Revolutionize
              <span className="gradient-text"> Examinations</span>
              <br />
              with Intelligent
              <span className="gradient-text"> AI</span>
            </h1>
            <p className="hero-subtitle">
              The world's most intelligent assessment platform. Deliver exams, 
              grade automatically, and gain insights—all in one secure platform.
            </p>
            <div className="hero-cta">
              <button className="primary-cta" onClick={handleGetStarted}>
                <span>Get Started Free</span>
                <Sparkles size={20} />
              </button>
              <button className="secondary-cta" onClick={handleRequestDemo}>
                <Calendar size={20} />
                <span>Request Demo</span>
              </button>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">5,000+</div>
                <div className="stat-label">Institutions</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">12.5M+</div>
                <div className="stat-label">Candidates</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">850K+</div>
                <div className="stat-label">Exams Delivered</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">65+</div>
                <div className="stat-label">Countries</div>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="dashboard-preview">
              <div className="dashboard-header">
                <div className="header-dots">
                  <div className="dot red"></div>
                  <div className="dot yellow"></div>
                  <div className="dot green"></div>
                </div>
              </div>
              <div className="dashboard-content">
                <div className="metric-card">
                  <div className="metric-label">Live Exams</div>
                  <div className="metric-value">142</div>
                  <div className="metric-trend up">+12%</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Avg. Grading Time</div>
                  <div className="metric-value">2.4s</div>
                  <div className="metric-trend up">-65%</div>
                </div>
                <div className="chart-preview"></div>
                <div className="ai-grading">
                  <Sparkles size={16} />
                  <span>AI Grading Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="trust-bar">
        <div className="trust-container">
          <div className="trust-label">Trusted by leading organizations</div>
          <div className="trust-logos">
            <div className="logo-item">Stanford</div>
            <div className="logo-item">MIT</div>
            <div className="logo-item">Google</div>
            <div className="logo-item">Microsoft</div>
            <div className="logo-item">Amazon</div>
            <div className="logo-item">IBM</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-container">
          <div className="section-header">
            <div className="section-badge">
              <Zap size={16} />
              <span>Why Evalis?</span>
            </div>
            <h2 className="section-title">
              Everything you need for
              <span className="gradient-text"> modern assessments</span>
            </h2>
            <p className="section-subtitle">
              Built with cutting-edge technology to solve real examination challenges
            </p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className={`feature-card ${feature.color}`}>
                <div className="feature-icon-container">
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <div className="feature-stat">{feature.stat}</div>
                <div className="feature-arrow">
                  <ArrowRight size={20} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Stories */}
      <section id="solutions" className="stories-section">
        <div className="section-container">
          <div className="section-header">
            <div className="section-badge">
              <Users size={16} />
              <span>Success Stories</span>
            </div>
            <h2 className="section-title">
              Loved by institutions
              <span className="gradient-text"> worldwide</span>
            </h2>
          </div>
          <div className="stories-grid">
            {userStories.map((story, index) => (
              <div key={index} className={`story-card ${story.color}`}>
                <div className="story-type">{story.type}</div>
                <h3 className="story-name">{story.name}</h3>
                <div className="story-impact">
                  <TrendingUp size={16} />
                  <span>{story.impact}</span>
                </div>
                <p className="story-quote">"{story.quote}"</p>
                <button className="story-cta">
                  <span>Read Case Study</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="testimonials-section">
        <div className="section-container">
          <div className="section-header">
            <div className="section-badge">
              <Star size={16} />
              <span>Testimonials</span>
            </div>
            <h2 className="section-title">
              What our customers
              <span className="gradient-text"> say</span>
            </h2>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-header">
                  <div className="avatar">{testimonial.image}</div>
                  <div className="testimonial-info">
                    <h4 className="testimonial-name">{testimonial.name}</h4>
                    <p className="testimonial-role">{testimonial.role}</p>
                  </div>
                  <div className="rating">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} size={16} fill="#FFD700" stroke="#FFD700" />
                    ))}
                  </div>
                </div>
                <p className="testimonial-quote">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="pricing-section">
        <div className="section-container">
          <div className="section-header">
            <div className="section-badge">
              <Award size={16} />
              <span>Simple Pricing</span>
            </div>
            <h2 className="section-title">
              Plans for every
              <span className="gradient-text"> organization</span>
            </h2>
            <p className="section-subtitle">
              Start free, upgrade as you grow. No hidden fees.
            </p>
          </div>
          <div className="pricing-grid">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
                {plan.popular && (
                  <div className="popular-badge">Most Popular</div>
                )}
                <div className="pricing-header">
                  <h3 className="plan-name">{plan.name}</h3>
                  <p className="plan-description">{plan.description}</p>
                  <div className="plan-price">
                    <span className="price">{plan.price}</span>
                    <span className="period">{plan.period}</span>
                  </div>
                </div>
                <ul className="plan-features">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="feature-item">
                      <CheckCircle size={16} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className={`plan-cta ${plan.popular ? 'primary' : 'secondary'}`} onClick={handleRequestDemo}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
          <div className="pricing-note">
            <Lock size={16} />
            <span>All plans include 256-bit SSL encryption and GDPR compliance</span>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="final-cta">
        <div className="cta-container">
          <div className="cta-background">
            <div className="cta-blob"></div>
          </div>
          <div className="cta-content">
            <h2 className="cta-title">
              Ready to transform your
              <span className="gradient-text"> assessments?</span>
            </h2>
            <p className="cta-subtitle">
              Join 5,000+ institutions using Evalis today
            </p>
            <div className="cta-buttons">
              <button className="cta-primary" onClick={handleGetStarted}>
                <span>Start Free Trial</span>
                <Sparkles size={20} />
              </button>
              <button className="cta-secondary" onClick={handleRequestDemo}>
                <span>Schedule a Demo</span>
                <Calendar size={20} />
              </button>
            </div>
            <div className="cta-footer">
              <div className="guarantee">
                <CheckCircle size={16} />
                <span>No credit card required</span>
              </div>
              <div className="guarantee">
                <CheckCircle size={16} />
                <span>14-day free trial</span>
              </div>
              <div className="guarantee">
                <CheckCircle size={16} />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Form */}
      <section id="demo-form" className="demo-form-section">
        <div className="section-container">
          <div className="form-container">
            <div className="form-content">
              <div className="form-header">
                <h3 className="form-title">Schedule a Personalized Demo</h3>
                <p className="form-subtitle">
                  See how Evalis can solve your specific assessment challenges
                </p>
              </div>

              {submitSuccess ? (
                <div className="success-message">
                  <Check className="success-icon" />
                  <h4>Thank You!</h4>
                  <p>Your demo request has been submitted successfully. We'll contact you within 24 hours.</p>
                  <button className="back-button" onClick={() => setSubmitSuccess(false)}>
                    Send Another Request
                  </button>
                </div>
              ) : (
                <form className="demo-form" onSubmit={handleSubmit}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="name">Full Name *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        placeholder="John Smith"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">Email Address *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="john@institution.edu"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="organization">Organization *</label>
                      <input
                        type="text"
                        id="organization"
                        name="organization"
                        placeholder="Stanford University"
                        value={formData.organization}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="role">Role</label>
                      <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                      >
                        <option value="">Select your role</option>
                        <option value="Administrator">Administrator</option>
                        <option value="Exam Controller">Exam Controller</option>
                        <option value="Faculty">Faculty</option>
                        <option value="HR Manager">HR Manager</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="form-group full-width">
                      <label htmlFor="challenges">What challenges are you facing?</label>
                      <textarea
                        id="challenges"
                        name="challenges"
                        placeholder="Tell us about your current assessment process, pain points, and what you hope to achieve..."
                        rows={3}
                        value={formData.challenges}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  {submitError && (
                    <div className="error-message">
                      <AlertCircle size={16} />
                      <span>{submitError}</span>
                    </div>
                  )}

                  <div className="form-footer">
                    <button 
                      type="submit" 
                      className="form-submit" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="spinner"></div>
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <span>Request Demo</span>
                          <Send size={20} />
                        </>
                      )}
                    </button>
                    <p className="form-note">
                      By submitting, you agree to our Privacy Policy. We'll contact you within 24 hours.
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-col">
              <div className="footer-brand">
                <Sparkles className="footer-logo-icon" />
                <span className="footer-logo-text">Evalis</span>
              </div>
              <p className="footer-tagline">
                Intelligent examination platform for the modern world.
              </p>
              <div className="contact-info">
                <div className="contact-item">
                  <MessageSquare size={16} />
                  <span>support@evalis.io</span>
                </div>
              </div>
            </div>
            <div className="footer-col">
              <h4 className="footer-title">Product</h4>
              <a href="#features" className="footer-link">Features</a>
              <a href="#solutions" className="footer-link">Solutions</a>
              <a href="#pricing" className="footer-link">Pricing</a>
              <a href="#" className="footer-link">API</a>
            </div>
            <div className="footer-col">
              <h4 className="footer-title">Company</h4>
              <a href="#" className="footer-link">About</a>
              <a href="#" className="footer-link">Blog</a>
              <a href="#" className="footer-link">Careers</a>
              <a href="#" className="footer-link">Contact</a>
            </div>
            <div className="footer-col">
              <h4 className="footer-title">Resources</h4>
              <a href="#" className="footer-link">Documentation</a>
              <a href="#" className="footer-link">Help Center</a>
              <a href="#" className="footer-link">Community</a>
              <a href="#" className="footer-link">Status</a>
            </div>
            <div className="footer-col">
              <h4 className="footer-title">Legal</h4>
              <a href="#" className="footer-link">Privacy</a>
              <a href="#" className="footer-link">Terms</a>
              <a href="#" className="footer-link">Security</a>
              <a href="#" className="footer-link">GDPR</a>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="copyright">
              © {new Date().getFullYear()} Evalis. All rights reserved.
            </div>
            <div className="footer-actions">
              <button className="footer-login" onClick={handleLogin}>
                Login to Dashboard
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
