import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import ClientLayout from '@/components/client/ClientLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import PublicAPI, { type PublicProject } from '@/api/publicAPI';

const Projects: React.FC = () => {
  const [projects, setProjects] = React.useState<PublicProject[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    PublicAPI.projects.list()
      .then((data) => {
        if (mounted) setProjects(data);
      })
      .catch((err) => {
        if (mounted) setError(err.message || 'Failed to load projects');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <ClientLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">Loading projects...</p>
          </motion.div>
        </div>
      </ClientLayout>
    );
  }

  if (error) {
    return (
      <ClientLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Oops! Something went wrong</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </motion.div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="mt-16 min-h-screen bg-background">
        {/* Hero Section */}
        <section className="py-16 sm:py-20 bg-gradient-to-br from-background via-secondary/10 to-purple-50/5 dark:to-purple-900/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-12 sm:mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                My <span className="text-purple-600 dark:text-purple-400 bg-gradient-to-r from-purple-600 to-purple-500 dark:from-purple-500 dark:to-purple-300 bg-clip-text">Portfolio</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
                Explore a collection of projects that showcase my skills, creativity, and passion for building exceptional digital experiences.
              </p>
              <div className="mt-8 flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  {projects.length} Projects Completed
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Full-Stack Development
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Modern Technologies
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Projects Grid Section */}
        {projects.length === 0 ? (
          <section className="py-16 sm:py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-6xl mb-6">🚀</div>
                <h2 className="text-2xl font-bold text-foreground mb-4">No Projects Yet</h2>
                <p className="text-muted-foreground mb-6">
                  I'm currently working on some amazing projects. Check back soon to see what I've been building!
                </p>
                <Button asChild>
                  <a href="/">Back to Home</a>
                </Button>
              </motion.div>
            </div>
          </section>
        ) : (
          <section className="py-16 sm:py-20 bg-secondary/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div 
                className="text-center mb-12 sm:mb-16"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl sm:text-4xl text-foreground mb-4">Featured Projects</h2>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                  Each project represents a unique challenge and solution, demonstrating my expertise across various technologies and domains.
                </p>
              </motion.div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {projects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -5 }}
                    className="h-full"
                  >
                    <Card className="bg-card/50 border-border hover:border-purple-500/50 overflow-hidden group backdrop-blur-sm transition-all duration-300 h-full">
                  {project.image && (
                        <div className="aspect-video overflow-hidden relative">
                          <motion.img
                      src={project.image}
                      alt={project.title}
                            className="w-full h-full object-cover transition-transform duration-500"
                            whileHover={{ scale: 1.1 }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="absolute top-4 right-4">
                            <motion.div
                              whileHover={{ scale: 1.1, rotate: 45 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Button size="sm" variant="outline" className="p-2 border-purple-500/50 hover:bg-purple-50 dark:hover:bg-purple-500/10 hover:border-purple-400 bg-white/90 dark:bg-black/90 backdrop-blur-sm" asChild>
                                <a href={project.url || '#'} target="_blank" rel="noopener noreferrer">
                                  <ArrowRight className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                </a>
                              </Button>
                            </motion.div>
                          </div>
                        </div>
                      )}
                      <CardContent className="p-6 font-raleway flex flex-col h-full">
                        {project.tags && (
                          <motion.div 
                            className="flex flex-wrap gap-2 mb-4"
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
                        
                        <div className="mb-4 flex-grow">
                          <h3 className="text-xl text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors mb-3">
                            {project.title}
                          </h3>
                          <p className="text-muted-foreground group-hover:text-foreground transition-colors">
                            {project.description}
                          </p>
                        </div>

                        <div className="mt-auto pt-4 border-t border-border/50">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {project.created_at ? new Date(project.created_at).toLocaleDateString() : 'Recently'}
                            </span>
                  {project.url && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-purple-500/50 hover:bg-purple-50 dark:hover:bg-purple-500/10 hover:border-purple-400"
                                asChild
                              >
                                <a href={project.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                      View Project
                                  <ArrowRight className="w-3 h-3" />
                    </a>
                              </Button>
                  )}
                          </div>
                        </div>
                </CardContent>
              </Card>
                  </motion.div>
            ))}
          </div>

              {/* Call to Action */}
              <motion.div 
                className="text-center mt-16"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <h3 className="text-2xl font-bold text-foreground mb-4">Ready to Start Your Project?</h3>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Let's collaborate to bring your ideas to life. I'm passionate about creating exceptional digital experiences that make a difference.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 border-none shadow-lg text-white"
                    asChild
                  >
                    <a href="/contact">Get In Touch</a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/">Back to Home</a>
                  </Button>
                </div>
              </motion.div>
            </div>
          </section>
        )}
      </div>
    </ClientLayout>
  );
};

export default Projects;

