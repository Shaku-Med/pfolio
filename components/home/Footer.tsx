'use client'
import Link from 'next/link';
import { Github, Twitter, Linkedin, Mail, Heart, ArrowUp, Sparkles, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '../ui/input';
import { motion } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useContext, useState } from 'react';
import { ContextProvider } from '../Context/ContextProvider';
import SubScribeAction from '@/app/@footer/Action/SubScribeAction';
import { toast } from 'sonner';
const Footer: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const { fingerPrint } = useContext(ContextProvider)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmailError('');
    
    // Email validation regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if(!fingerPrint) return;
    const fingerprint = await fingerPrint.generateFingerprint();
    if(fingerprint){
      let id = fingerPrint.generateUniqueId(fingerprint);
      if(!id) return;
      setLoading(true)
      const res = await SubScribeAction(email, id)
      if(res){
        if(typeof res === 'string'){
          setEmailError(res)
        }
        else {
          toast.success('You have been subscribed to the newsletter')
        }
      }
      else {
        setEmailError(`We were unable to subscribe you to the newsletter, please try again later`)
      }
      setLoading(false)
    }
  };

  return (
    <footer className="relative flex items-center justify-center w-full bg-background/80 backdrop-blur-2xl border-t border-border/30 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-20 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl opacity-20 pointer-events-none" />
      
      <div className="relative sm:px-8 px-4 container ">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 py-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div className="space-y-6" variants={itemVariants}>
            <div className="group cursor-pointer">
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative w-14 h-14 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center border border-primary/30 backdrop-blur-sm group-hover:scale-105 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <img src="/Icons/web/icon-512.png" alt="Logo" className="w-10 h-10 object-contain relative z-10" />
                </div>
                <div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <h2 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                          <span>Mohamed Amara </span>
                          <sup className="text-xs text-muted-foreground">(Medzy Amara)</sup>
                        </h2>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Medzy Amara is my nickname, My name is Mohamed Amara.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <p className="text-sm text-muted-foreground font-medium">Full Stack Developer</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground/80 leading-relaxed">
            Building cool stuff on the internet with whatever tech makes sense and designs that don't suck.            </p>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Available for projects</span>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h3 className="text-sm font-bold mb-6 text-foreground flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Navigation</span>
            </h3>
            <ul className="space-y-3">
              {['Home', 'About', 'Projects', 'Contact', 'Posts', 'Gallery', 'Download', 'Music', 'Resume', 'Experience', 'Skills'].map((item, index) => (
                <motion.li 
                  key={index}
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Link
                    href={`/${item === 'Home' ? '' : item.toLowerCase()}`}
                    className="group text-sm text-muted-foreground hover:text-foreground transition-all duration-300 flex items-center space-x-2"
                  >
                    <div className="w-1 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative">
                      {item}
                      <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-300" />
                    </span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h3 className="text-sm font-bold mb-6 text-foreground flex items-center space-x-2">
              <Send className="w-4 h-4 text-primary" />
              <span>Stay Connected</span>
            </h3>
            <p className="text-sm text-muted-foreground/80 mb-6 leading-relaxed">
            Subscribe to my newsletter if you want the good stuff – new projects, random tech finds, and whatever else I'm nerding out about.            </p>
            <form onSubmit={loading ? e => e.preventDefault() : handleSubmit} className="space-y-4">
              <div className="relative group">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`bg-background/60 border ${emailError ? 'border-red-500' : 'border-border/50'} rounded-xl backdrop-blur-sm transition-all duration-300 focus:border-primary/50 focus:bg-background/80 group-hover:border-border/70 pl-4 pr-12`}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground/50">
                  <Mail className="w-4 h-4" />
                </div>
              </div>
              {emailError && (
                <p className="text-sm text-red-500">{emailError}</p>
              )}
              <Button className="w-full bg-gradient-to-r from-primary via-primary to-accent hover:from-primary/90 hover:via-primary/90 hover:to-accent/90 rounded-xl font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl">
                {loading ? 'Subscribing...' : 'Subscribe Now'}
              </Button>
            </form>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h3 className="text-sm font-bold mb-6 text-foreground">Let's Connect</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Github, href: 'https://github.com/Shaku-Med', label: 'GitHub', color: 'hover:text-white' },
                { icon: Twitter, href: 'https://twitter.com/medzyamara', label: 'Twitter', color: 'hover:text-blue-400' },
                { icon: Linkedin, href: 'https://www.linkedin.com/in/mohamed-amara-b84447247/', label: 'LinkedIn', color: 'hover:text-blue-600' },
                { icon: Mail, href: 'mailto:amaramohamedb@gmail.com', label: 'Email', color: 'hover:text-red-500' },
              ].map((social) => (
                <motion.div
                  key={social.label}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="w-full h-12 rounded-xl hover:bg-accent/80 transition-all duration-300 backdrop-blur-sm border border-border/20 hover:border-border/40 group"
                  >
                    <a href={social.href} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2">
                      <social.icon className={`w-5 h-5 text-muted-foreground transition-colors duration-300 ${social.color}`} />
                      <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                        {social.label}
                      </span>
                    </a>
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        <motion.div 
          className="flex flex-col md:flex-row items-center justify-between py-8 border-t border-border/30 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4 md:mb-0">
            <span>Crafted with</span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
            >
              <Heart className="w-4 h-4 text-red-500" />
            </motion.div>
            <span>by</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <span className="font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Medzy Amara
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Medzy Amara is my nickname, My name is Mohamed Amara.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center space-x-6">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} All rights reserved
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;