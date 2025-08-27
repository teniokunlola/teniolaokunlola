import React from 'react';
import ClientLayout from '@/components/client/ClientLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PublicAPI, { type PublicTestimonial } from '@/api/publicAPI';
import { motion } from 'framer-motion';
import { useScroll, useTransform } from 'framer-motion';
import { Star, Quote, Users, Award, MessageCircle, Calendar, Building } from 'lucide-react';


const Testimonials: React.FC = () => {
  const [testimonials, setTestimonials] = React.useState<PublicTestimonial[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  

  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    PublicAPI.testimonials.list()
      .then((data) => {
        if (mounted) setTestimonials(data);
      })
      .catch((err) => {
        if (mounted) setError(err.message || 'Failed to load testimonials');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const renderStars = (rating: number) => {
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

  const stats = [
    {
      icon: Users,
      value: testimonials.length,
      label: 'Happy Clients',
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      icon: Star,
      value: testimonials.length > 0 ? (testimonials.reduce((acc, t) => acc + (t.rating || 0), 0) / testimonials.length).toFixed(1) : '0',
      label: 'Average Rating',
      color: 'text-yellow-500'
    },
    {
      icon: Award,
      value: testimonials.filter(t => (t.rating || 0) >= 4).length,
      label: '5-Star Reviews',
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
              Client <span className="text-purple-600 dark:text-purple-400 bg-gradient-to-r from-purple-600 to-purple-500 dark:from-purple-500 dark:to-purple-300 bg-clip-text">Testimonials</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Discover what clients and colleagues have to say about working with me. 
              These testimonials reflect my commitment to quality, communication, and delivering exceptional results.
            </p>
          </motion.div>

          {/* Stats Section */}
          {!loading && testimonials.length > 0 && (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
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
                        <stat.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${stat.color}`} />
                      </motion.div>
                      <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">{stat.value}</div>
                      <div className="text-sm sm:text-base text-muted-foreground">{stat.label}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 sm:py-16 md:py-20 font-raleway bg-gradient-to-br from-secondary/5 via-background to-purple-50/5 dark:to-purple-900/10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
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
                  <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </motion.div>
              </div>
              <div className="text-lg sm:text-xl text-muted-foreground">Loading testimonials...</div>
            </motion.div>
          )}

        {error && (
            <motion.div 
              className="text-center py-12 sm:py-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-4 sm:mb-6 bg-gradient-to-br from-red-500 to-red-600 rounded-full">
                <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <div className="text-lg sm:text-xl text-red-500">{error}</div>
            </motion.div>
          )}

        {!loading && !error && testimonials.length === 0 && (
            <motion.div 
              className="text-center py-12 sm:py-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-4 sm:mb-6 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full">
                <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <div className="text-lg sm:text-xl text-muted-foreground">No testimonials found.</div>
              <p className="text-sm sm:text-base text-muted-foreground mt-2">Check back later for client feedback.</p>
            </motion.div>
          )}

        {!loading && !error && testimonials.length > 0 && (
            <>
              <motion.div 
                className="text-center mb-8 sm:mb-12 md:mb-16"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl sm:text-3xl md:text-4xl text-foreground mb-3 sm:mb-4">
                  What People <span className="text-purple-600 dark:text-purple-400 bg-gradient-to-r from-purple-600 to-purple-500 dark:from-purple-500 dark:to-purple-300 bg-clip-text">Say</span>
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                  Real feedback from real clients and colleagues about their experience working with me.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {testimonials.map((testimonial, index) => (
                  <motion.div
                    key={testimonial.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="group"
                  >
                    <Card className="bg-card/80 border-border hover:border-purple-500/50 overflow-hidden backdrop-blur-sm transition-all duration-300 h-full shadow-lg shadow-purple-500/10">
                      <CardContent className="p-6 sm:p-8 h-full flex flex-col">
                        {/* Quote Icon */}
                        <motion.div
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                          viewport={{ once: true }}
                          className="mb-4 sm:mb-6"
                        >
                          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full group-hover:from-purple-200 group-hover:to-blue-200 dark:group-hover:from-purple-800/50 dark:group-hover:to-blue-800/50 transition-all duration-300">
                            <Quote className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600 dark:text-purple-400" />
                          </div>
                        </motion.div>

                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-4 sm:mb-6">
                          {renderStars(Math.round(testimonial.rating || 0))}
                          <Badge variant="secondary" className="ml-2 bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/30">
                            {Number(testimonial.rating || 0).toFixed(1)}
                          </Badge>
                        </div>

                        {/* Feedback */}
                        <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 italic group-hover:text-foreground transition-colors duration-300 flex-grow leading-relaxed">
                          "{testimonial.feedback}"
                        </p>

                        {/* Client Info */}
                        <div className="mt-auto">
                          <div className="flex items-center gap-4">
                  {testimonial.image && (
                              <motion.img
                      src={testimonial.image}
                      alt={testimonial.name}
                                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-purple-500/30 group-hover:border-purple-500/50 transition-all duration-300"
                                whileHover={{ scale: 1.1 }}
                                transition={{ duration: 0.3 }}
                              />
                            )}
                            <div className="flex-1">
                              <div className="font-semibold text-foreground text-sm sm:text-base">{testimonial.name}</div>
                              {testimonial.position && testimonial.company && (
                                <div className="text-sm text-purple-600 dark:text-purple-400 flex items-center gap-1">
                                  <Building className="w-3 h-3" />
                                  {testimonial.position} at {testimonial.company}
                                </div>
                              )}
                              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(testimonial.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </div>
                            </div>
                          </div>
                  </div>
                </CardContent>
              </Card>
                  </motion.div>
            ))}
          </div>
            </>
        )}
      </div>
      </section>
    </ClientLayout>
  );
};

export default Testimonials;





