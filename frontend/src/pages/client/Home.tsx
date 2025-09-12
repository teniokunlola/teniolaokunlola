import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { motion } from 'framer-motion';
import ClientLayout from '@/components/client/ClientLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Download, Sun, Moon, Sparkles, Star, ArrowRight, Phone, MapPin, ChevronDown, ChevronUp, GraduationCap, Briefcase } from 'lucide-react';

import PublicAPI, {
  type PublicAbout,
  type PublicProject,
  type PublicSkill,
  type PublicTestimonial,
  type PublicService,
  type PublicExperience,
  type PublicEducation,
  type ContactFormData
} from '@/api/publicAPI';
import { 
  validateAndSanitizeName, 
  validateAndSanitizeEmail, 
  validateAndSanitizeMessage, 
  RateLimiter 
} from '@/lib/security';
import { logger } from '@/lib/logger';
import { getErrorMessage } from '@/types/errors';
import mainImage from '@/assets/main.jpg';

const Home: React.FC = () => {
  // Theme state management
  const [isDarkMode, setIsDarkMode] = React.useState(true);
  
  const [about, setAbout] = React.useState<PublicAbout | null>(null);
  const [projects, setProjects] = React.useState<PublicProject[]>([]);
  const [skills, setSkills] = React.useState<PublicSkill[]>([]);
  const [testimonials, setTestimonials] = React.useState<PublicTestimonial[]>([]);
  const [services, setServices] = React.useState<PublicService[]>([]);
  const [experience, setExperience] = React.useState<PublicExperience[]>([]);
  const [education, setEducation] = React.useState<PublicEducation[]>([]);

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [contactForm, setContactForm] = React.useState<ContactFormData>({ name: '', email: '', message: '' });
  const [contactLoading, setContactLoading] = React.useState(false);
  const [contactSuccess, setContactSuccess] = React.useState<string | null>(null);
  const [contactError, setContactError] = React.useState<string | null>(null);
  const [expandedProjects, setExpandedProjects] = React.useState<Set<number>>(new Set());
  const [expandedTestimonials, setExpandedTestimonials] = React.useState<Set<number>>(new Set());
  const [expandedServices, setExpandedServices] = React.useState<Set<number>>(new Set());
  const [expandedExperienceItems, setExpandedExperienceItems] = React.useState<Set<number>>(new Set());
  const [showAllProjects, setShowAllProjects] = React.useState(false);
  
  // Rate limiting for contact form
  const rateLimiter = React.useMemo(() => new RateLimiter(3, 60000), []); // 3 attempts per minute

  const testimonialsPrevRef = React.useRef<HTMLButtonElement>(null);
  const testimonialsNextRef = React.useRef<HTMLButtonElement>(null);
  const servicesPrevRef = React.useRef<HTMLButtonElement>(null);
  const servicesNextRef = React.useRef<HTMLButtonElement>(null);

  // Theme toggle function
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Toggle project expansion
  const toggleProjectExpansion = (projectId: number) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  // Toggle testimonial expansion
  const toggleTestimonialExpansion = (testimonialId: number) => {
    setExpandedTestimonials(prev => {
      const newSet = new Set(prev);
      if (newSet.has(testimonialId)) {
        newSet.delete(testimonialId);
      } else {
        newSet.add(testimonialId);
      }
      return newSet;
    });
  };

  // Toggle service expansion
  const toggleServiceExpansion = (serviceId: number) => {
    setExpandedServices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(serviceId)) {
        newSet.delete(serviceId);
      } else {
        newSet.add(serviceId);
      }
      return newSet;
    });
  };

  // Toggle experience description expansion
  const toggleExperienceExpansion = (experienceId: number) => {
    setExpandedExperienceItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(experienceId)) {
        newSet.delete(experienceId);
      } else {
        newSet.add(experienceId);
      }
      return newSet;
    });
  };

  // Apply theme to document
  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    Promise.all([
      PublicAPI.about.list(),
      PublicAPI.projects.list(),
      PublicAPI.skills.list(),
      PublicAPI.testimonials.list(),
      PublicAPI.services.list(),
      PublicAPI.experience.list(),
      PublicAPI.education.list(),
      PublicAPI.socialLinks.list(),
      PublicAPI.settings.list(),
    ])
      .then(([ 
        aboutData,
        projectsData,
        skillsData,
        testimonialsData,
        servicesData,
        experienceData,
        educationData,
        _socialLinksData,
        _settingsData,
      ]) => {
        if (mounted) {
          setAbout(aboutData[0] || null);
          setProjects(projectsData);
          setSkills(skillsData);
          setTestimonials(testimonialsData);
          setServices(servicesData);
          setExperience(experienceData);
          setEducation(educationData);
          // Note: socialLinks and settings are not used in the current UI
        }
      })
      .catch((err) => {
        if (mounted) setError(err.message || 'Failed to load home data');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Apply length limits to prevent excessive input
    let sanitizedValue = value;
    if (name === 'name' && value.length > 100) sanitizedValue = value.slice(0, 100);
    if (name === 'email' && value.length > 254) sanitizedValue = value.slice(0, 254);
    if (name === 'message' && value.length > 2000) sanitizedValue = value.slice(0, 2000);
    
    setContactForm({ ...contactForm, [name]: sanitizedValue });
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactLoading(true);
    setContactSuccess(null);
    setContactError(null);
    
    // Check rate limiting
    if (!rateLimiter.isAllowed('contact-form')) {
      setContactError('Too many submission attempts. Please wait a minute before trying again.');
      return;
    }
    
    try {
      // Create sanitized data for submission
      const sanitizedData = {
        name: validateAndSanitizeName(contactForm.name).value,
        email: validateAndSanitizeEmail(contactForm.email).value,
        message: validateAndSanitizeMessage(contactForm.message).value,
      };
      
      await PublicAPI.contact.create(sanitizedData);
      setContactSuccess('Message sent successfully!');
      setContactForm({ name: '', email: '', message: '' });
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      logger.error('Failed to send message', { error: err });
      setContactError(errorMessage);
    } finally {
      setContactLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <motion.div
          key={i}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.1, type: "spring", stiffness: 300 }}
        >
          <Star className={`w-4 h-4 ${i <= rating ? 'fill-purple-500 text-purple-500 dark:fill-purple-400 dark:text-purple-400' : 'text-muted-foreground'}`} />
        </motion.div>
      );
    }
    return <div className="flex">{stars}</div>;
  };

  if (loading) {
  return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div 
          className="text-lg text-foreground flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-6 h-6 text-purple-500" />
          </motion.div>
          Loading...
        </motion.div>
              </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-destructive">{error}</div>
            </div>
    );
  }

  return (
    <ClientLayout>
    <div className="mt-14 bg-background text-foreground overflow-x-hidden">
      {/* Animated Background */}
      {/* <motion.div 
        className="fixed inset-0 z-0"
        style={{ 
          background: isDarkMode 
            ? "radial-gradient(ellipse at top, rgba(139, 92, 246, 0.1) 0%, transparent 50%)"
            : "radial-gradient(ellipse at top, rgba(139, 92, 246, 0.05) 0%, transparent 50%)",
          y: backgroundY 
        }}
      /> */}

      {/* Theme Toggle Button */}
      <motion.div 
        className="fixed top-2 right-2 sm:top-2 sm:right-2 z-50"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 300 }}
      >
        <motion.button
          onClick={toggleTheme}
          className="p-3 rounded-full bg-card border border-border shadow-lg hover:shadow-xl transition-all duration-300 group"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Toggle theme"
        >
          <motion.div
            animate={{ rotate: isDarkMode ? 0 : 180 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-purple-500 group-hover:text-purple-400 transition-colors" />
            ) : (
              <Moon className="w-5 h-5 text-purple-600 group-hover:text-purple-500 transition-colors" />
            )}
          </motion.div>
        </motion.button>
      </motion.div>

      {/* Hero Section */}
      <section id="home" className="relative flex items-center justify-center pt-16 sm:pt-20 pb-12 sm:pb-16 lg:pb-32 bg-gradient-to-br from-background via-secondary/20 to-purple-50/10 dark:to-purple-900/20 pt-16 sm:pt-20 pb-12 sm:pb-16 lg:pb-32">
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-purple-500 dark:bg-purple-400 rounded-full opacity-20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-20, 20],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
            <motion.div
              className="text-center lg:text-left order-2 lg:order-1"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.h1 
                className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl xl:text-6xl mb-4 sm:mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                I am <span className="text-purple-600 dark:text-purple-500 bg-gradient-to-r from-purple-600 to-purple-500 dark:from-purple-500 dark:to-purple-300 bg-clip-text font-raleway">{about?.first_name || "Teniola"}</span> <span className="text-purple-600 dark:text-purple-500 bg-gradient-to-r from-purple-600 to-purple-500 dark:from-purple-500 dark:to-purple-300 bg-clip-text font-raleway">{about?.last_name || "Okunlola"}</span>,<br />
                <span className="text-foreground">{about?.title || "a Full-Stack Developer"}</span>
              </motion.h1>
              
              <motion.div 
                className="flex items-center justify-center lg:justify-start gap-2 mb-4 sm:mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                {renderStars(5)}
                <span className="text-muted-foreground"></span>
              </motion.div>
              
              <motion.p 
                className="text-sm sm:text-base md:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-lg mx-auto lg:mx-0 font-raleway leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                {about?.summary || "I'm a passionate full-stack developer with a knack for building user-friendly and efficient web applications through extreme attention to details."}
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start font-raleway"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 border-none shadow-lg shadow-purple-500/25 text-white text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4" onClick={() => window.open(`mailto:${about?.email || "teniolaokunlola@proton.me"}`, '_blank')}>
                    <Mail className="w-4 h-4 mr-2" /> Get in Touch
                  </Button>
                </motion.div>
                {about?.resume && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button variant="outline" size="lg" className="w-full sm:w-auto border-purple-500 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4" asChild>
                      <a href={about.resume} target="_blank" rel="noopener noreferrer">
                        <Download className="w-4 h-4 mr-2" />Download CV
                      </a>
                    </Button>
                  </motion.div>
                )}
              </motion.div>
              
              {/* Contact Info */}
              <motion.div 
                className="flex flex-wrap gap-3 sm:gap-4 md:gap-6 mt-6 sm:mt-8 text-xs sm:text-sm text-muted-foreground justify-center lg:justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
              >
                {about?.email && (
                  <motion.div 
                    className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                    <a href={`mailto:${about.email}`} target="_blank" rel="noopener noreferrer">
                    <span className="sm:hidden">Email</span>
                      <span className="hidden sm:inline">{about.email}</span>
                    </a>
                  </motion.div>
                )}
                {about?.phone_number && (
                  <motion.div 
                    className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                    <a href={`tel:${about.phone_number}`} target="_blank" rel="noopener noreferrer">
                    <span className="sm:hidden">Phone</span>
                      <span className="hidden sm:inline">{about.phone_number}</span>
                    </a>
                  </motion.div>
                )}
                {about?.address && (
                  <motion.div 
                    className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                  >
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(about.address)}`} target="_blank" rel="noopener noreferrer">
                    <span className="sm:hidden">Location</span>
                      <span className="hidden sm:inline">{about.address}</span>
                    </a>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="flex justify-center mt-6 sm:mt-8 lg:mt-0 order-1 lg:order-2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="relative">
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 2, 0, -2, 0]
                  }}
                  transition={{ 
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <div className="relative">
                    <motion.div 
                      className="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/30 dark:from-purple-500/20 dark:to-purple-600/30 overflow-hidden border-4 border-purple-500/30 shadow-2xl shadow-purple-500/20"
                      whileHover={{ scale: 1.05, borderColor: "rgba(139, 92, 246, 0.8)" }}
                      transition={{ duration: 0.3 }}
                    >
                      <img
                        src={about?.profile_picture || mainImage}
                        alt={about?.full_name || "Profile"}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                    <motion.div 
                      className="absolute -bottom-2 -right-2 sm:-bottom-4 sm:-right-4 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-600 to-purple-500 rounded-full shadow-lg flex items-center justify-center border-4 border-background"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      whileHover={{ scale: 1.2 }}
                    >
                      <span className="text-lg sm:text-xl md:text-2xl">👋🏾</span>
                    </motion.div>
                  </div>
                </motion.div>
                
                {/* Orbit rings */}
                <motion.div
                  className="absolute inset-0 border border-purple-500/20 rounded-full"
                  style={{ width: '110%', height: '110%', top: '-5%', left: '-5%' }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      {services.length > 0 && (
        <section id="services" className="py-12 sm:py-16 md:py-20 bg-secondary/30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-8 sm:mb-12 md:mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl text-foreground mb-3 sm:mb-4"><span className="text-purple-600 dark:text-purple-500">Services</span> I Offer</h2>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4 sm:px-0">
                I offer a range of services to help you build your web application.
              </p>
            </motion.div>
            
            <div className="relative">
              <Swiper
                spaceBetween={16}
                slidesPerView={1}
                allowTouchMove={true}
                touchRatio={1}
                touchAngle={45}
                threshold={5}
                touchStartPreventDefault={true}
                touchMoveStopPropagation={true}
                simulateTouch={true}
                grabCursor={true}
                loop={false}
                breakpoints={{
                  640: { 
                    slidesPerView: 2,
                    spaceBetween: 20
                  },
                  1024: { 
                    slidesPerView: 3,
                    spaceBetween: 24
                  },
                  1280: { 
                    slidesPerView: 4,
                    spaceBetween: 24
                  }
                }}
                modules={[Navigation, Pagination]}
                navigation={{
                  prevEl: servicesPrevRef.current,
                  enabled: true,
                  nextEl: servicesNextRef.current,
                }}
                onBeforeInit={(swiper) => {
                  if (swiper.params.navigation && typeof swiper.params.navigation === 'object') {
                    const navigation = swiper.params.navigation as { prevEl?: HTMLElement | null; nextEl?: HTMLElement | null };
                    navigation.prevEl = servicesPrevRef.current;
                    navigation.nextEl = servicesNextRef.current;
                  }
                }}
                pagination={{ 
                  clickable: true,
                  dynamicBullets: true,
                  dynamicMainBullets: 3
                }}
                className="pb-12"
              >
              {services.map((service, index) => (
                  <SwiperSlide key={service.id}>
                <motion.div 
                      className="relative group h-full"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-purple-800/10 dark:from-purple-600/20 dark:to-purple-800/20 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                      <Card className="bg-card/80 border-border hover:border-purple-500/50 p-4 sm:p-6 md:p-8 h-full relative z-10 backdrop-blur-sm transition-all duration-300 flex flex-col">
                        <div className="mb-4 sm:mb-6 flex-1">
                      <motion.div 
                        className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-600 to-purple-500 rounded-lg flex items-center justify-center text-white text-lg sm:text-xl mb-3 sm:mb-4 shadow-lg"
                        whileHover={{ scale: 1.2, rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        {index + 1}
                      </motion.div>
                      <h3 className="text-lg sm:text-xl text-foreground mb-2 sm:mb-4">{service.name}</h3>
                      {(() => {
                        const isExpanded = expandedServices.has(service.id);
                        const descriptionLength = service.description?.length || 0;
                        const shouldShowExpandButton = descriptionLength > 160;
                        return (
                          <div className="flex flex-col">
                            <p
                              className={`text-sm sm:text-base text-muted-foreground text-wrap leading-relaxed ${!isExpanded && shouldShowExpandButton ? 'line-clamp-3' : ''}`}
                              style={{
                                minHeight: shouldShowExpandButton ? '4.5rem' : 'auto',
                                maxHeight: !isExpanded && shouldShowExpandButton ? '4.5rem' : 'none',
                                overflow: !isExpanded && shouldShowExpandButton ? 'hidden' : 'visible'
                              }}
                            >
                              {service.description}
                            </p>
                            {shouldShowExpandButton && (
                              <motion.button
                                onClick={() => toggleServiceExpansion(service.id)}
                                className="mt-2 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors flex items-center gap-1 self-start"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                {isExpanded ? (
                                  <>
                                    <span>Show Less</span>
                                    <ChevronUp className="w-3 h-3" />
                                  </>
                                ) : (
                                  <>
                                    <span>Read More</span>
                                    <ChevronDown className="w-3 h-3" />
                                  </>
                                )}
                              </motion.button>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                          className="mt-auto"
                    >
                          <Button variant="outline" size="sm" className="w-full text-purple-600 dark:text-purple-400 border-purple-500/50 hover:bg-purple-50 dark:hover:bg-purple-500/10 hover:border-purple-400 transition-all duration-300 text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-3">
                        Learn More
                        <motion.div
                          className="ml-2"
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                        </motion.div>
                      </Button>
                    </motion.div>
                  </Card>
                </motion.div>
                  </SwiperSlide>
                ))}
              </Swiper>
              
              {/* Navigation Buttons */}
              <div className="flex justify-center gap-4 mt-8">
                <motion.button
                  ref={servicesPrevRef}
                  className="w-12 h-12 rounded-full bg-card hover:bg-purple-100 dark:hover:bg-purple-600 flex items-center justify-center transition-all duration-300 border border-border hover:border-purple-500 shadow-md"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Previous Services"
                >
                  ←
                </motion.button>
                <motion.button
                  ref={servicesNextRef}
                  className="w-12 h-12 rounded-full bg-card hover:bg-purple-100 dark:hover:bg-purple-600 flex items-center justify-center transition-all duration-300 border border-border hover:border-purple-500 shadow-md"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Next Services"
                >
                  →
                </motion.button>
              </div>
            </div>
          </div>
        </section>
        )}

        {/* Skills Section */}
      {skills.length > 0 && (
        <section id="skills" className="py-12 sm:py-16 md:py-20 bg-secondary/20">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl sm:text-3xl md:text-4xl text-foreground mb-4 sm:mb-6">Why Hire Me For Your Next Project?</h2>
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
                  You're not only getting a developer who can deliver, but also someone who thinks about long-term usability, performance, and your business goals.
                </p>
                <div className="space-y-3 sm:space-y-4 md:space-y-6">
                  {skills.map((skill) => (
                    <div key={skill.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="text-sm sm:text-base md:text-lg font-semibold text-foreground min-w-[80px] sm:min-w-[100px]">{skill.name}</div>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                        <div
                          className="h-2 bg-purple-600 rounded-full"
                          style={{ width: `${skill.proficiency}%` }}
                        ></div>
                      </div>
                      <div className="text-sm sm:text-base md:text-lg font-semibold text-purple-600 dark:text-purple-400 min-w-[40px] text-right">{skill.proficiency}%</div>
                    </div>
                  ))}
                </div>
              </motion.div>
              
              <motion.div 
                className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
              >
                {[
                  { number: projects.length, label: "Projects Completed" },
                  { number: experience.length, label: "Years Experience" },
                  { number: testimonials.length, label: "Client Satisfaction" },
                  { number: "24/7", label: "Support Available" }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05, rotateY: 10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-card/50 border-border hover:border-purple-500/50 p-3 sm:p-4 md:p-6 text-center backdrop-blur-sm transition-all duration-300 group">
                      <motion.div 
                        className="text-xl sm:text-2xl md:text-3xl text-purple-600 dark:text-purple-400 mb-1 sm:mb-2"
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ duration: 0.5, delay: index * 0.1, type: "spring", stiffness: 300 }}
                        viewport={{ once: true }}
                      >
                        {stat.number}
                      </motion.div>
                      <p className="text-xs sm:text-sm md:text-base text-muted-foreground group-hover:text-foreground transition-colors leading-tight">{stat.label}</p>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>
        )}

         {/* Projects Section */}
         {projects.length > 0 && (
        <section id="projects" className="py-12 sm:py-16 md:py-20 bg-secondary/20">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <motion.div 
              className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 sm:mb-12 md:mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl text-foreground mb-3 sm:mb-4">Let's Have A Look At My Projects</h2>
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl">
                  Have a look at some of the projects I've worked on.
                </p>
              </div>
              {projects.length > 6 && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 border-none shadow-lg text-white text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4"
                    onClick={() => setShowAllProjects(prev => !prev)}
                >
                    {showAllProjects ? 'Show Less' : 'Show All Projects'}
                </Button>
              </motion.div>
              )}
            </motion.div>
            
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 ${showAllProjects && projects.length > 10 ? 'max-h-[70vh] overflow-y-auto pr-1' : ''}`}>
              {(showAllProjects ? projects : projects.slice(0, 6)).map((project, index) => {
                const isExpanded = expandedProjects.has(project.id);
                const descriptionLength = project.description?.length || 0;
                const shouldShowExpandButton = descriptionLength > 120;
                
                return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="h-fit"
                >
                  <Card className="bg-card/50 border-border rounded-lg hover:border-purple-500/50 overflow-hidden group backdrop-blur-sm transition-all duration-300 h-full p-0">
                    {project.image && (
                      <div className="aspect-[2/3] overflow-hidden relative">
                        <motion.img
                          src={project.image}
                          alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-500"
                          whileHover={{ scale: 1.05 }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    )}
                      <CardContent className="p-4 sm:p-6 font-raleway flex flex-col h-full">
                      {project.tags && (
                        <motion.div 
                          className="flex flex-wrap gap-2 mb-3 sm:mb-4"
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                          viewport={{ once: true }}
                        >
                          {project.tags.map((tag: string, tagIndex: number) => (
                            <motion.div
                              key={tag}
                              initial={{ scale: 0 }}
                              whileInView={{ scale: 1 }}
                              transition={{ duration: 0.3, delay: tagIndex * 0.1 }}
                              viewport={{ once: true }}
                            >
                              <Badge variant="secondary" className="text-xs bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/30 hover:bg-purple-200 dark:hover:bg-purple-500/30 transition-colors">
                                {tag}
                              </Badge>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                      <div className="flex items-start justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <h3 className="text-lg sm:text-xl text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors leading-tight">{project.title}</h3>
                        {project.url && (
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 45 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Button size="sm" variant="outline" className="p-2 border-purple-500/50 hover:bg-purple-50 dark:hover:bg-purple-500/10 hover:border-purple-400" asChild>
                              <a href={project.url} target="_blank" rel="noopener noreferrer">
                                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-400" />
                              </a>
                            </Button>
                          </motion.div>
                        )}
                      </div>
                        
                        {/* Description with fixed height and expandable functionality */}
                        <div className="flex-1 flex flex-col">
                          <div 
                            className={`text-sm sm:text-base text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed expandable-content ${
                              !isExpanded && shouldShowExpandButton ? 'line-clamp-3' : ''
                            }`}
                            style={{
                              minHeight: shouldShowExpandButton ? '4.5rem' : 'auto',
                              maxHeight: !isExpanded && shouldShowExpandButton ? '4.5rem' : 'none',
                              overflow: !isExpanded && shouldShowExpandButton ? 'hidden' : 'visible'
                            }}
                          >
                            {project.description}
                      </div>
                          
                          {/* Expand/Collapse Button */}
                          {shouldShowExpandButton && (
                <motion.button
                              onClick={() => toggleProjectExpansion(project.id)}
                              className="mt-2 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors flex items-center gap-1 self-start"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {isExpanded ? (
                                <>
                                  <span>Show Less</span>
                                  <ChevronUp className="w-3 h-3" />
                                </>
                              ) : (
                                <>
                                  <span>Read More</span>
                                  <ChevronDown className="w-3 h-3" />
                                </>
                              )}
                </motion.button>
                          )}
            </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
        )}

        {/* Certifications Section */}
        {(experience.length > 0 || education.length > 0) && (
        <section id="certifications" className="py-12 sm:py-16 md:py-20 bg-background">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-8 sm:mb-12 md:mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl text-foreground mb-3 sm:mb-4">My <span className="text-purple-600 dark:text-purple-400">Professional</span> & <span className="text-purple-600 dark:text-purple-400">Educational</span> Journey</h2>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4 sm:px-0">
                A journey through my professional career and achievements.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {/* Experience Card */}
              {experience.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="bg-card/50 border-border hover:border-purple-500/50 p-6 sm:p-8 h-full backdrop-blur-sm transition-all duration-300">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                        <Briefcase className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-foreground">Work Experience</h3>
                    </div>
                    
                    <div className={`space-y-4 ${experience.length > 4 ? 'max-h-64 overflow-y-auto pr-2' : ''}`}>
                      {experience.map((exp, index) => (
                        <motion.div
                          key={exp.id}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: index * 0.1 }}
                          viewport={{ once: true }}
                          className="relative pl-6 border-l-2 border-purple-200 dark:border-purple-800"
                        >
                          <div className="absolute -left-2 top-0 w-4 h-4 bg-purple-500 rounded-full border-2 border-background"></div>
                          <div className="space-y-1">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <h4 className="text-base sm:text-lg font-semibold text-foreground">{exp.job_title}</h4>
                              <span className="text-xs sm:text-sm text-muted-foreground">
                        {exp.start_date} - {exp.end_date || 'Present'}
                              </span>
                      </div>
                            <p className="text-sm sm:text-base text-purple-600 dark:text-purple-400 font-medium">{exp.company}</p>
                            {(() => {
                              const isExpanded = expandedExperienceItems.has(exp.id);
                              const descriptionLength = exp.description?.length || 0;
                              const shouldShowExpandButton = descriptionLength > 160;
                              return (
                                <div className="flex flex-col">
                                  <p
                                    className={`text-xs sm:text-sm text-muted-foreground leading-relaxed ${!isExpanded && shouldShowExpandButton ? 'line-clamp-3' : ''}`}
                                    style={{
                                      minHeight: shouldShowExpandButton ? '4.5rem' : 'auto',
                                      maxHeight: !isExpanded && shouldShowExpandButton ? '4.5rem' : 'none',
                                      overflow: !isExpanded && shouldShowExpandButton ? 'hidden' : 'visible'
                                    }}
                                  >
                                    {exp.description}
                                  </p>
                                  {shouldShowExpandButton && (
                                    <motion.button
                                      onClick={() => toggleExperienceExpansion(exp.id)}
                                      className="mt-2 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors flex items-center gap-1 self-start"
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                    >
                                      {isExpanded ? (
                                        <>
                                          <span>Show Less</span>
                                          <ChevronUp className="w-3 h-3" />
                                        </>
                                      ) : (
                                        <>
                                          <span>Read More</span>
                                          <ChevronDown className="w-3 h-3" />
                                        </>
                                      )}
                                    </motion.button>
                                  )}
                                </div>
                              );
                            })()}
                    </div>
                </motion.div>
              ))}
                    </div>
                    
                    
                    
                  </Card>
                </motion.div>
      )}

              {/* Education Card */}
      {education.length > 0 && (
            <motion.div 
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="bg-card/50 border-border hover:border-purple-500/50 p-6 sm:p-8 h-full backdrop-blur-sm transition-all duration-300">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                        <GraduationCap className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-foreground">Certifications</h3>
                    </div>
                    
                    <div className={`space-y-4 ${education.length > 4 ? 'max-h-64 overflow-y-auto pr-2' : ''}`}>
                      {education.map((edu, index) => (
                        <motion.div
                          key={edu.id}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: index * 0.1 }}
                          viewport={{ once: true }}
                          className="relative pl-6 border-l-2 border-purple-200 dark:border-purple-800"
                        >
                          <div className="absolute -left-2 top-0 w-4 h-4 bg-purple-500 rounded-full border-2 border-background"></div>
                          <div className="space-y-1">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <h4 className="text-base sm:text-lg font-semibold text-foreground">{edu.degree}</h4>
                              <span className="text-xs sm:text-sm text-muted-foreground">
                          {edu.start_date} - {edu.end_date || 'Present'}
                              </span>
                        </div>
                            <p className="text-sm sm:text-base text-purple-600 dark:text-purple-400 font-medium">{edu.institution}</p>
                        {(edu.certificate || edu.url) && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="mt-2 text-xs border-purple-500/50 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10"
                                asChild
                              >
                            <a href={(edu.certificate || edu.url)!} target="_blank" rel="noopener noreferrer">
                              View Certificate
                            </a>
                          </Button>
                        )}
                      </div>
                </motion.div>
              ))}
            </div>
                    
                    
                  </Card>
                </motion.div>
            )}
            </div>
          </div>
        </section>
        )}

        {/* Testimonials Section */}
        {testimonials.length > 0 && (
        <section id="testimonials"    className="py-16 sm:py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-12 sm:mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl text-foreground mb-4">Testimonials That Speak For Me</h2>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                Listen to what people I've worked with have to say about my work and ethics.
              </p>
            </motion.div>
            
            <div className="relative touch-pan-y">
            <Swiper
              spaceBetween={24}
              slidesPerView={1}
              allowTouchMove={true}
              touchRatio={1}
              touchAngle={45}
              threshold={5}
              touchStartPreventDefault={true}
              touchMoveStopPropagation={true}
              simulateTouch={true}
              grabCursor={true}
              autoplay={{
                delay: 2000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              loop={true}
              breakpoints={{
                640: { slidesPerView: 1 },
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
              modules={[Navigation, Pagination]}
              navigation={{
                prevEl: testimonialsPrevRef.current,
                enabled: true,
                nextEl: testimonialsNextRef.current,
              }}
              onBeforeInit={(swiper) => {
                if (swiper.params.navigation && typeof swiper.params.navigation === 'object') {
                  const navigation = swiper.params.navigation as { prevEl?: HTMLElement | null; nextEl?: HTMLElement | null };
                  navigation.prevEl = testimonialsPrevRef.current;
                  navigation.nextEl = testimonialsNextRef.current;
                }
              }}
              pagination={{ 
                clickable: true,
                dynamicBullets: true,
                dynamicMainBullets: 3
              }}
                className="pb-12"
            >
                {testimonials.map((testimonial, index) => {
                  const isExpanded = expandedTestimonials.has(testimonial.id);
                  const feedbackLength = testimonial.feedback?.length || 0;
                  const shouldShowExpandButton = feedbackLength > 150;
                  
                  return (
                <SwiperSlide key={testimonial.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="h-full"
                    >
                        <Card className="bg-card/50 border-border hover:border-purple-500/50 mt-2 p-4 sm:p-6 h-full backdrop-blur-sm transition-all duration-300 group flex flex-col">
                        <div className="flex">
                        {renderStars(Math.round(testimonial.rating ?? 0))}
                          <span className="ml-2 text-muted-foreground">{Number(testimonial.rating ?? 0).toFixed(1)}</span>
                      </div>
                          
                          {/* Feedback with fixed height and expandable functionality */}
                          <div className="flex-1 flex flex-col mb-3">
                            <div 
                              className={`text-muted-foreground italic group-hover:text-foreground transition-colors leading-relaxed expandable-content ${
                                !isExpanded && shouldShowExpandButton ? 'line-clamp-3' : ''
                              }`}
                              style={{
                                minHeight: shouldShowExpandButton ? '4.5rem' : 'auto',
                                maxHeight: !isExpanded && shouldShowExpandButton ? '4.5rem' : 'none',
                                overflow: !isExpanded && shouldShowExpandButton ? 'hidden' : 'visible'
                              }}
                            >
                              "{testimonial.feedback}"
                            </div>
                            
                            {/* Expand/Collapse Button */}
                            {shouldShowExpandButton && (
                              <motion.button
                                onClick={() => toggleTestimonialExpansion(testimonial.id)}
                                className="mt-2 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors flex items-center gap-1 self-start"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                {isExpanded ? (
                                  <>
                                    <span>Show Less</span>
                                    <ChevronUp className="w-3 h-3" />
                                  </>
                                ) : (
                                  <>
                                    <span>Read More</span>
                                    <ChevronDown className="w-3 h-3" />
                                  </>
                                )}
                              </motion.button>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 mt-auto">
                            {testimonial.image && (
                            <motion.img
                              src={testimonial.image}
                              alt={testimonial.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-purple-500/30"
                              whileHover={{ scale: 1.1, borderColor: "rgba(139, 92, 246, 0.8)" }}
                              transition={{ duration: 0.3 }}
                            />
                          )}
                          <div>
                            <div className="text-sm text-foreground">{testimonial.name}</div>
                            <div className="text-sm text-purple-600 dark:text-purple-400">
                              {testimonial.position}, {testimonial.company}
                            </div>
                          </div>
                        </div>
                  </Card>
                    </motion.div>
                </SwiperSlide>
                  );
                })}
            </Swiper>
              
              <div className="flex justify-center gap-4 mt-8">
                <motion.button
                  ref={testimonialsPrevRef}
                  className="w-12 h-12 rounded-full bg-card hover:bg-purple-100 dark:hover:bg-purple-600 flex items-center justify-center transition-all duration-300 border border-border hover:border-purple-500 shadow-md"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Previous"
                >
                  ←
                </motion.button>
                <motion.button
                  ref={testimonialsNextRef}
                  className="w-12 h-12 rounded-full bg-card hover:bg-purple-100 dark:hover:bg-purple-600 flex items-center justify-center transition-all duration-300 border border-border hover:border-purple-500 shadow-md"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Next"
                >
                  →
                </motion.button>
            </div>
            </div>
          </div>
        </section>
        )}
        
        {/* Contact Section */}
      <section id="contact" className="py-12 sm:py-16 md:py-20 font-raleway bg-gradient-to-br from-background via-secondary/10 to-purple-50/5 dark:to-purple-900/20">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-8 sm:mb-12 md:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl text-foreground mb-3 sm:mb-4">
              Have An Awesome Project Idea? <span className="text-purple-600 dark:text-purple-400 bg-gradient-to-r from-purple-600 to-purple-500 dark:from-purple-500 dark:to-purple-300 bg-clip-text ">Let's Talk About It, I'd Love To Hear From You</span>
            </h2>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.01 }}
          >
            <Card className="bg-card/80 border-border hover:border-purple-500/50 p-4 sm:p-6 md:p-8 backdrop-blur-sm transition-all duration-300">
              <form onSubmit={handleContactSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                  >
                    <input
                      type="text"
                      name="name"
                      value={contactForm.name}
                      onChange={handleContactChange}
                      placeholder="Your Name"
                      maxLength={100}
                      className="bg-background/50 border-border text-foreground placeholder-muted-foreground focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-300 w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base"
                      required
                    />
                  </motion.div>
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                  >
                    <input
                      type="email"
                      name="email"
                      value={contactForm.email}
                      onChange={handleContactChange}
                      placeholder="Your Email"
                      maxLength={254}
                      className="bg-background/50 border-border text-foreground placeholder-muted-foreground focus:border-purple-500/20 transition-all duration-300 w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base"
                      required
                    />
                  </motion.div>
                </div>
                <motion.div
                  whileFocus={{ scale: 1.02 }}
                >
                  <textarea
                    name="message"
                    value={contactForm.message}
                    onChange={handleContactChange}
                    placeholder="Tell me about your project..."
                    maxLength={2000}
                    className="bg-background/50 border-border text-foreground placeholder-muted-foreground focus:border-purple-500 focus:ring-purple-500/20 min-h-[100px] sm:min-h-[120px] transition-all duration-300 w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base"
                    required
                  />
                </motion.div>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center font-raleway justify-center">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      type="submit"
                      className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 px-6 sm:px-8 py-3 sm:py-4 shadow-lg shadow-purple-500/25 border-none text-white text-sm sm:text-base"
                      disabled={contactLoading}
                    >
                      {contactLoading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="mr-2"
                        >
                          <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                        </motion.div>
                      ) : null}
                      {contactLoading ? 'Sending...' : 'Send Message'}
                    </Button>
                  </motion.div>
                  {contactSuccess && (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-green-600 dark:text-green-400 text-xs sm:text-sm"
                    >
                      {contactSuccess}
                    </motion.div>
                  )}
                  {contactError && (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-red-600 dark:text-red-400 text-xs sm:text-sm"
                    >
                      {contactError}
                    </motion.div>
                  )}
                </div>
              </form>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
    </ClientLayout>
  );
};

export default Home;