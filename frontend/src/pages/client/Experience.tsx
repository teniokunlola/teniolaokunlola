import React from 'react';
import { motion } from 'framer-motion';
import ClientLayout from '@/components/client/ClientLayout';
import { Card } from '@/components/ui/card';
import PublicAPI, { type PublicExperience } from '@/api/publicAPI';

const ExperiencePage: React.FC = () => {
  const [experience, setExperience] = React.useState<PublicExperience[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setLoading(true);
    setError(null);
    PublicAPI.experience.list()
      .then(setExperience)
      .catch((err) => setError(err.message || 'Failed to load experience'))
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
              <h1 className="text-3xl sm:text-4xl md:text-5xl text-foreground mb-3 sm:mb-4">Professional Experience</h1>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                Roles I have held and what I accomplished.
              </p>
            </motion.div>

            {error && (
              <div className="text-destructive text-center mb-6">{error}</div>
            )}

            {loading ? (
              <div className="text-center text-muted-foreground">Loading...</div>
            ) : (
              <div className="space-y-4 sm:space-y-6 md:space-y-8">
                {experience.map((exp, index) => (
                  <motion.div
                    key={exp.id}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className="bg-card/50 border-border hover:border-purple-500/50 p-4 sm:p-6 md:p-8 backdrop-blur-sm transition-all duration-300">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <div>
                          <h3 className="text-lg sm:text-xl md:text-2xl text-foreground mb-1 sm:mb-2">{exp.job_title}</h3>
                          <p className="text-base sm:text-lg text-purple-600 dark:text-purple-400">{exp.company}</p>
                        </div>
                        <div className="text-muted-foreground text-xs sm:text-sm md:text-base">
                          {exp.start_date} - {exp.end_date || 'Present'}
                        </div>
                      </div>
                      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{exp.description}</p>
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

export default ExperiencePage;


