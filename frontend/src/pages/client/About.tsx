import React from 'react';
import ClientLayout from '@/components/client/ClientLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import PublicAPI, { type PublicAbout } from '@/api/publicAPI';
import { motion } from 'framer-motion';
import { useScroll, useTransform } from 'framer-motion';
import { Mail, Phone, MapPin, Download, User, Award, Star, Sparkles } from 'lucide-react';


const About: React.FC = () => {
  const [about, setAbout] = React.useState<PublicAbout | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  

  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    PublicAPI.about.list()
      .then((data) => {
        if (mounted) {
          setAbout(data[0] || null);
        }
      })
      .catch((err) => {
        if (mounted) setError(err.message || 'Failed to load about info');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const renderStars = (rating: number = 5) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 sm:w-5 sm:h-5 ${
          i < rating
            ? 'text-yellow-500 fill-current'
            : 'text-gray-300 dark:text-gray-600'
        }`}
      />
    ));
  };

  const skills = [
    { name: 'Frontend Development', level: 95, color: 'from-blue-500 to-cyan-500' },
    { name: 'Backend Development', level: 90, color: 'from-purple-500 to-pink-500' },
    { name: 'UI/UX Design', level: 85, color: 'from-green-500 to-emerald-500' },
    { name: 'DevOps & Deployment', level: 80, color: 'from-orange-500 to-red-500' },
    { name: 'Database Design', level: 88, color: 'from-indigo-500 to-purple-500' },
    { name: 'API Development', level: 92, color: 'from-teal-500 to-blue-500' }
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
              <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </motion.div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-foreground mb-3 sm:mb-4 font-bold">
              About <span className="text-purple-600 dark:text-purple-400 bg-gradient-to-r from-purple-600 to-purple-500 dark:from-purple-500 dark:to-purple-300 bg-clip-text">Me</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Get to know the person behind the code. I'm passionate about creating innovative solutions 
              and delivering exceptional user experiences through technology.
            </p>
          </motion.div>

          {/* Profile Section */}
          {!loading && about && (
            <motion.div 
              className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
            >
              {/* Profile Picture */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
                className="text-center lg:text-left order-2 lg:order-1"
              >
              {about.profile_picture && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="inline-block relative"
                  >
                <img
                  src={about.profile_picture}
                  alt={about.full_name}
                      className="w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 rounded-full object-cover border-4 border-purple-500/30 shadow-2xl shadow-purple-500/25"
                    />
                    <motion.div
                      className="absolute -bottom-2 -right-2 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg"
                      whileHover={{ scale: 1.1, rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Award className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </motion.div>
                  </motion.div>
                )}
              </motion.div>

              {/* Profile Info */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                viewport={{ once: true }}
                className="text-center lg:text-left order-1 lg:order-2"
              >
                <motion.h2 
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-4 sm:mb-6 font-bold text-foreground"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  viewport={{ once: true }}
                >
                  {about.full_name}
                </motion.h2>
                
                <motion.div 
                  className="flex items-center justify-center lg:justify-start gap-2 mb-4 sm:mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  viewport={{ once: true }}
                >
                  {renderStars(5)}
                  <Badge variant="secondary" className="ml-2 bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/30">
                    5.0 Rating
                  </Badge>
                </motion.div>
                
                <motion.p 
                  className="text-sm sm:text-base md:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  viewport={{ once: true }}
                >
                  {about.summary}
                </motion.p>
                
                <motion.div 
                  className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start font-raleway"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                  viewport={{ once: true }}
                >
                  {about.email && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 border-none shadow-lg shadow-purple-500/25 text-white text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4" onClick={() => window.open(`mailto:${about.email}`, '_blank')}>
                        <Mail className="w-4 h-4 mr-2" /> Get in Touch
                      </Button>
                    </motion.div>
                  )}
                {about.resume && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button variant="outline" size="lg" className="w-full sm:w-auto border-purple-500 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4" asChild>
                        <a href={about.resume} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4 mr-2" />
                          Download CV
                        </a>
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </section>

      {/* About Content Section */}
      <section className="py-12 sm:py-16 md:py-20 font-raleway bg-gradient-to-br from-secondary/5 via-background to-purple-50/5 dark:to-purple-900/10">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          {loading && (
            <motion.div 
              className="text-center py-12 sm:py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-4 sm:mb-6 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </motion.div>
              </div>
              <div className="text-lg sm:text-xl text-muted-foreground">Loading about information...</div>
            </motion.div>
          )}

          {error && (
            <motion.div 
              className="text-center py-12 sm:py-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-4 sm:mb-6 bg-gradient-to-br from-red-500 to-red-600 rounded-full">
                <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <div className="text-lg sm:text-xl text-red-500">{error}</div>
            </motion.div>
          )}

          {!loading && !error && about && (
            <>
              {/* Contact Information */}
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                {about.email && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="group"
                  >
                    <Card className="bg-card/50 border-border hover:border-purple-500/50 overflow-hidden backdrop-blur-sm transition-all duration-300 h-full">
                      <CardContent className="p-4 sm:p-6 text-center">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 mb-3 sm:mb-4 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-full group-hover:from-blue-200 group-hover:to-cyan-200 dark:group-hover:from-blue-800/50 dark:group-hover:to-cyan-800/50 transition-all duration-300"
                        >
                          <Mail className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 dark:text-blue-400" />
                        </motion.div>
                        <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1 sm:mb-2">Email</h3>
                        <a 
                          href={`mailto:${about.email}`}
                          className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors duration-300 block"
                        >
                          {about.email}
                        </a>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {about.phone_number && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="group"
                  >
                    <Card className="bg-card/50 border-border hover:border-purple-500/50 overflow-hidden backdrop-blur-sm transition-all duration-300 h-full">
                      <CardContent className="p-4 sm:p-6 text-center">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 mb-3 sm:mb-4 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full group-hover:from-green-200 group-hover:to-emerald-200 dark:group-hover:from-green-800/50 dark:group-hover:to-emerald-800/50 transition-all duration-300"
                        >
                          <Phone className="w-6 h-6 sm:w-7 sm:h-7 text-green-600 dark:text-green-400" />
                        </motion.div>
                        <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1 sm:mb-2">Phone</h3>
                        <a 
                          href={`tel:${about.phone_number}`}
                          className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors duration-300 block"
                        >
                          {about.phone_number}
                        </a>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {about.address && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="group"
                  >
                    <Card className="bg-card/50 border-border hover:border-purple-500/50 overflow-hidden backdrop-blur-sm transition-all duration-300 h-full">
                      <CardContent className="p-4 sm:p-6 text-center">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 mb-3 sm:mb-4 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full group-hover:from-purple-200 group-hover:to-pink-200 dark:group-hover:from-purple-800/50 dark:group-hover:to-pink-800/50 transition-all duration-300"
                        >
                          <MapPin className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600 dark:text-purple-400" />
                        </motion.div>
                        <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1 sm:mb-2">Location</h3>
                        <div className="text-sm sm:text-base text-muted-foreground">
                          {about.address}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </motion.div>

              {/* Skills Section */}
              <motion.div 
                className="mb-8 sm:mb-12"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl sm:text-3xl md:text-4xl text-foreground mb-6 sm:mb-8 text-center">
                  Technical <span className="text-purple-600 dark:text-purple-400 bg-gradient-to-r from-purple-600 to-purple-500 dark:from-purple-500 dark:to-purple-300 bg-clip-text">Skills</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {skills.map((skill, index) => (
                    <motion.div
                      key={skill.name}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
                      viewport={{ once: true }}
                      whileHover={{ y: -5, scale: 1.02 }}
                      className="group"
                    >
                      <Card className="bg-card/50 border-border hover:border-purple-500/50 overflow-hidden backdrop-blur-sm transition-all duration-300 h-full">
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm sm:text-base font-semibold text-foreground">{skill.name}</h3>
                            <span className="text-sm text-muted-foreground">{skill.level}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 sm:h-3">
                            <motion.div
                              className={`h-2 sm:h-3 bg-gradient-to-r ${skill.color} rounded-full transition-all duration-1000 ease-out`}
                              initial={{ width: 0 }}
                              whileInView={{ width: `${skill.level}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 1, delay: 0.8 + index * 0.1 }}
                            />
              </div>
            </CardContent>
          </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </>
        )}

        {!loading && !error && !about && (
            <motion.div 
              className="text-center py-12 sm:py-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-4 sm:mb-6 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full">
                <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <div className="text-lg sm:text-xl text-muted-foreground">No about information found.</div>
              <p className="text-sm sm:text-base text-muted-foreground mt-2">Check back later for profile details.</p>
            </motion.div>
        )}
      </div>
      </section>
    </ClientLayout>
  );
};

export default About;
