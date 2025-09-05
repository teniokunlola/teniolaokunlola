import React from 'react';
import { motion } from 'framer-motion';
import ClientLayout from '@/components/client/ClientLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PublicAPI, { type PublicEducation } from '@/api/publicAPI';

const EducationPage: React.FC = () => {
  const [education, setEducation] = React.useState<PublicEducation[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setLoading(true);
    setError(null);
    PublicAPI.education.list()
      .then(setEducation)
      .catch((err) => setError(err.message || 'Failed to load education'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ClientLayout>
      <div className="mt-16 min-h-screen bg-background text-foreground">
        <section className="py-12 sm:py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <motion.div
              className="text-center mb-8 sm:mb-12 md:mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl text-foreground mb-3 sm:mb-4">Education & Certifications</h1>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                A collection of my academic background and professional certifications.
              </p>
            </motion.div>

            {error && (
              <div className="text-destructive text-center mb-6">{error}</div>
            )}

            {loading ? (
              <div className="text-center text-muted-foreground">Loading...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                {education.map((edu, index) => (
                  <motion.div
                    key={edu.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.05 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -5 }}
                  >
                    <Card className="bg-card/50 border-border hover:border-purple-500/50 p-4 sm:p-6 h-full backdrop-blur-sm transition-all duration-300">
                      <div className="flex flex-col gap-2 h-full">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <h3 className="text-lg sm:text-xl text-foreground mb-1">{edu.degree}</h3>
                            <p className="text-sm sm:text-base text-purple-600 dark:text-purple-400">{edu.institution}</p>
                          </div>
                          <div className="text-muted-foreground text-xs sm:text-sm">
                            {edu.start_date} - {edu.end_date || 'Present'}
                          </div>
                        </div>
                        <div className="mt-auto flex justify-between items-center">
                          <div className="text-xs text-muted-foreground">#{edu.id}</div>
                          {(edu.certificate || edu.url) && (
                            <Button variant="outline" size="sm" className="border-purple-500/50 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10" asChild>
                              <a href={(edu.certificate || edu.url)!} target="_blank" rel="noopener noreferrer">
                                View Certificate
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </ClientLayout>
  );
};

export default EducationPage;


