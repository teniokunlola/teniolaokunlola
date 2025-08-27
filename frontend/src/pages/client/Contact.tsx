import React from 'react';
import ClientLayout from '@/components/client/ClientLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import PublicAPI, { type ContactFormData } from '@/api/publicAPI';
import { toast } from '@/components/ui/toast';
import { motion } from 'framer-motion';
import { useScroll, useTransform } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Sparkles, MessageCircle, Clock, CheckCircle } from 'lucide-react';
import { useSettingsStore } from '@/store';
import { validateAndSanitizeName, validateAndSanitizeEmail, validateAndSanitizeMessage, RateLimiter } from '@/lib/security';
import { logger } from '@/lib/logger';
import { getErrorMessage } from '@/types/errors';

const Contact: React.FC = () => {
  const [form, setForm] = React.useState<ContactFormData>({ name: '', email: '', message: '' });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  
  const { settings, fetchSettings } = useSettingsStore();
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  
  // Rate limiting for form submissions
  const rateLimiter = React.useMemo(() => new RateLimiter(3, 60000), []); // 3 attempts per minute

  React.useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Apply length limits to prevent excessive input
    let sanitizedValue = value;
    if (name === 'name' && value.length > 100) sanitizedValue = value.slice(0, 100);
    if (name === 'email' && value.length > 254) sanitizedValue = value.slice(0, 254);
    if (name === 'message' && value.length > 2000) sanitizedValue = value.slice(0, 2000);
    
    setForm({ ...form, [name]: sanitizedValue });
  };

  const validate = () => {
    // Validate and sanitize name
    const nameValidation = validateAndSanitizeName(form.name);
    if (!nameValidation.isValid) return nameValidation.error;
    
    // Validate and sanitize email
    const emailValidation = validateAndSanitizeEmail(form.email);
    if (!emailValidation.isValid) return emailValidation.error;
    
    // Validate and sanitize message
    const messageValidation = validateAndSanitizeMessage(form.message);
    if (!messageValidation.isValid) return messageValidation.error;
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    
    // Check rate limiting
    if (!rateLimiter.isAllowed('contact-form')) {
      setError('Too many submission attempts. Please wait a minute before trying again.');
      toast.error('Too many submission attempts. Please wait a minute before trying again.');
      return;
    }
    
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }
    
    setLoading(true);
    try {
      // Create sanitized data for submission
      const sanitizedData = {
        name: validateAndSanitizeName(form.name).value,
        email: validateAndSanitizeEmail(form.email).value,
        message: validateAndSanitizeMessage(form.message).value,
      };
      
      await PublicAPI.contact.create(sanitizedData);
      setSuccess(true);
      setForm({ name: '', email: '', message: '' });
      toast.success('Message sent successfully!');
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      logger.error('Failed to send message', { error: err });
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      value: settings.site_email || 'contact@example.com',
      link: `mailto:${settings.site_email || 'contact@example.com'}`,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      icon: Phone,
      title: 'Phone',
      value: settings.site_phone || '+1 (555) 123-4567',
      link: `tel:${settings.site_phone || '+1 (555) 123-4567'}`,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      icon: MapPin,
      title: 'Location',
      value: `${settings.site_city || 'City'}, ${settings.site_state || 'State'}`,
      link: '#',
      color: 'text-purple-600 dark:text-purple-400'
    }
  ];

  return (
    <ClientLayout>
      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 md:py-20 font-raleway bg-gradient-to-br from-background via-secondary/10 to-purple-50/5 dark:to-purple-900/20 overflow-hidden">
        {/* Animated Background */}
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{ y: backgroundY }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-blue-500/10" />
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        </motion.div>

        <div className="relative max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-8 sm:mb-12 md:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-4 sm:mb-6 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full"
            >
              <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </motion.div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-foreground mb-3 sm:mb-4 font-bold">
              Let's <span className="text-purple-600 dark:text-purple-400 bg-gradient-to-r from-purple-600 to-purple-500 dark:from-purple-500 dark:to-purple-300 bg-clip-text">Connect</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Have an amazing project idea? Let's discuss how we can bring your vision to life. 
              I'm always excited to hear about new opportunities and collaborations.
            </p>
          </motion.div>

          {/* Contact Information Cards */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group"
              >
                <Card className="bg-card/50 border-border hover:border-purple-500/50 overflow-hidden backdrop-blur-sm transition-all duration-300 h-full">
                  <CardContent className="p-4 sm:p-6 text-center">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 mb-3 sm:mb-4 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full group-hover:from-purple-200 group-hover:to-blue-200 dark:group-hover:from-purple-800/50 dark:group-hover:to-blue-800/50 transition-all duration-300`}
                    >
                      <info.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${info.color}`} />
                    </motion.div>
                    <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1 sm:mb-2">{info.title}</h3>
                    <a 
                      href={info.link} 
                      className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors duration-300 block"
                    >
                      {info.value}
                    </a>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-12 sm:py-16 md:py-20 font-raleway bg-gradient-to-br from-secondary/5 via-background to-purple-50/5 dark:to-purple-900/10">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-8 sm:mb-12 md:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl text-foreground mb-3 sm:mb-4">
              Send Me a <span className="text-purple-600 dark:text-purple-400 bg-gradient-to-r from-purple-600 to-purple-500 dark:from-purple-500 dark:to-purple-300 bg-clip-text">Message</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Fill out the form below and I'll get back to you as soon as possible. 
              I typically respond within 24 hours.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.01 }}
          >
            <Card className="bg-card/80 border-border hover:border-purple-500/50 p-4 sm:p-6 md:p-8 backdrop-blur-sm transition-all duration-300 shadow-xl shadow-purple-500/10">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="name" className="text-sm sm:text-base font-medium text-foreground">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
            <Input
              id="name"
              name="name"
              type="text"
                      placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
              disabled={loading}
              required
                      className="bg-background/50 border-border text-foreground placeholder-muted-foreground focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-300 w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base h-12 sm:h-14"
                    />
                  </motion.div>
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="email" className="text-sm sm:text-base font-medium text-foreground">
                      Email Address <span className="text-red-500">*</span>
                    </Label>
            <Input
              id="email"
              name="email"
              type="email"
                      placeholder="Enter your email address"
              value={form.email}
              onChange={handleChange}
              disabled={loading}
              required
                      className="bg-background/50 border-border text-foreground placeholder-muted-foreground focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-300 w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base h-12 sm:h-14"
            />
                  </motion.div>
          </div>
                <motion.div
                  whileFocus={{ scale: 1.02 }}
                  className="space-y-2"
                >
                  <Label htmlFor="message" className="text-sm sm:text-base font-medium text-foreground">
                    Your Message <span className="text-red-500">*</span>
                  </Label>
            <textarea
              id="message"
              name="message"
                    placeholder="Tell me about your project, idea, or how I can help you..."
              value={form.message}
              onChange={handleChange}
              disabled={loading}
              required
              rows={6}
                    className="bg-background/50 border-border text-foreground placeholder-muted-foreground focus:border-purple-500 focus:ring-purple-500/20 min-h-[120px] sm:min-h-[140px] transition-all duration-300 w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base resize-none"
                  />
                </motion.div>

                {/* Status Messages */}
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm sm:text-base bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 sm:px-4 py-2 sm:py-3"
                  >
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    {error}
                  </motion.div>
                )}
                
                {success && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm sm:text-base bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-3 sm:px-4 py-2 sm:py-3"
                  >
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    Message sent successfully! I'll get back to you soon.
                  </motion.div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center font-raleway justify-center pt-2">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full sm:w-auto"
                  >
                    <Button
                      type="submit"
                      className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 px-6 sm:px-8 py-3 sm:py-4 shadow-lg shadow-purple-500/25 border-none text-white text-sm sm:text-base font-semibold h-12 sm:h-14"
                      disabled={loading}
                    >
                      {loading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="mr-2"
                        >
                          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                        </motion.div>
                      ) : (
                        <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      )}
                      {loading ? 'Sending Message...' : 'Send Message'}
                    </Button>
                  </motion.div>
          </div>
        </form>
            </Card>
          </motion.div>

          {/* Additional Info */}
          <motion.div 
            className="text-center mt-8 sm:mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm sm:text-base">
              <Clock className="w-4 h-4" />
              <span>Response time: Usually within 24 hours</span>
            </div>
          </motion.div>
      </div>
      </section>
    </ClientLayout>
  );
};

export default Contact;

