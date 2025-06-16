'use client'

import React, { useContext, useState } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Mail, Clock, Zap, ArrowRight, HelpCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useDeviceFingerprint } from '../DeviceFingerprint'
import { toast } from 'sonner'
import SetQuickToken from '@/app/Auth/Functions/SetQuickToken'
import { ContextProvider } from '@/components/Context/ContextProvider'

interface ContactHomeProps {
    token?: string | null;
}
// 
const ContactHome: React.FC<ContactHomeProps> = ({ token }) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  let nav = useRouter()
  const { fingerPrint } = useContext(ContextProvider);

  const handleLiveChat = async (): Promise<void> => {
    if(!fingerPrint) return;
    setDialogOpen(false)
    const fingerprint = await fingerPrint.generateFingerprint()
    if(!fingerprint){
      toast.error(`Something went wrong while trying to set things up. Please refresh this page and try again.`)
      return;
    }
    let id = fingerPrint.generateUniqueId(fingerprint)

    if(id) {
      try {
        if(!token){
          toast.error(`It looks like an access token wasn't made for you, please try refreshing this page.`)
          return;
        }
        // 
        let qt = await SetQuickToken(`quick_chat_session`, `${token}`, [], [`${id}`])
        if(!qt){
          toast.error(`Something went wrong while trying to set things up. Please refresh this page and try again.`)
          return;
        }
        // 
        const response = await fetch(`/api/finger/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        
        if (data.error) {
          toast.error('Failed to verify fingerprint');
          return;
        }

        if (data.isBlocked) {
          toast.error('Access denied');
          return;
        }

        nav.push(`/contact/${id}`);
        toast.success('Live chat started', {
          duration: 5000,
          dismissible: true,
          description: `You can now start a live chat with me`,
          action: {
            label: `Go Back`,
            onClick: () => {
              if(window.confirm(`Are you sure you want to go back? Ok, I'll be here here waiting for your message.`)){
                if(window.history.length > 1){
                  nav.back()
                }
              }
            }
          }
        });
      } catch (error) {
        console.error('Fingerprint verification error:', error);
        toast.error('Failed to start chat');
      }
    } else {
      toast.error('No fingerprint found')
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8, rotateY: -15 },
    visible: {
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15
      }
    },
    hover: {
      scale: 1.05,
      rotateY: 5,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10
      }
    }
  }

  const iconVariants = {
    hover: {
      scale: 1.2,
      rotate: 360,
      transition: {
        duration: 0.8,
        ease: 'easeInOut'
      }
    }
  }

  const buttonVariants = {
    hover: {
      scale: 1.02,
      boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
      transition: {
        duration: 0.2
      }
    },
    tap: {
      scale: 0.98
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
      
      <div className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center mb-16"
          >
            <motion.div variants={itemVariants}>
              <h1 className="text-6xl sm:text-7xl font-black text-foreground mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Let's Connect
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-primary to-primary/50 mx-auto mb-6" />
              <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
                Ready to bring your vision to life? Choose your preferred way to get in touch and let's create something extraordinary together.
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto"
          >
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              className="group"
            >
              <div className="bg-card/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-border/50 h-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="text-center mb-8">
                    <div className="relative inline-block">
                      <motion.div
                        variants={iconVariants}
                        whileHover="hover"
                        className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 mb-6 shadow-lg"
                      >
                        <MessageCircle className="w-10 h-10 text-primary-foreground" />
                      </motion.div>
                      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                          <button className="absolute -top-2 -right-2 w-8 h-8 bg-muted-foreground hover:bg-foreground text-background rounded-full flex items-center justify-center transition-colors">
                            <HelpCircle className="w-4 h-4" />
                          </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md z-[1000000000001] max-h-full overflow-auto">
                          <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">Live Chat Privacy Notice</DialogTitle>
                            <DialogDescription className="text-base">
                              Understanding how your secure conversation works
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4 text-muted-foreground">
                            <p className="leading-relaxed">
                              Our secure live chat system uses <span className="font-semibold text-foreground">advanced device fingerprinting</span> to create your unique session identity without requiring any personal login credentials.
                            </p>
                            
                            <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-5 border border-primary/20">
                              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                                Privacy & Security Features
                              </h4>
                              <div className="space-y-2 text-sm">
                                <p className="flex items-start gap-2">
                                  <span className="text-green-500 font-mono text-xs mt-1">✓</span>
                                  <span>Your IP address combined with a unique device identifier creates an encrypted session key</span>
                                </p>
                                <p className="flex items-start gap-2">
                                  <span className="text-green-500 font-mono text-xs mt-1">✓</span>
                                  <span>Messages are exclusively accessible from this specific device and network combination</span>
                                </p>
                                <p className="flex items-start gap-2">
                                  <span className="text-green-500 font-mono text-xs mt-1">✓</span>
                                  <span>Other users on your network cannot access your private conversation history</span>
                                </p>
                                <p className="flex items-start gap-2">
                                  <span className="text-green-500 font-mono text-xs mt-1">✓</span>
                                  <span>Full conversation history and deletion rights remain under your exclusive control</span>
                                </p>
                              </div>
                            </div>
                            
                            <p className="text-sm bg-muted/30 rounded-lg p-3 border-l-4 border-primary">
                              <span className="font-medium text-foreground">Enterprise-grade security:</span> Your conversations are protected by the same technology used in professional business communications.
                            </p>
                          </div>
                          
                          <div className="flex gap-3 mt-6">
                            <Button
                              variant="outline"
                              onClick={() => setDialogOpen(false)}
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleLiveChat}
                              className="flex-1"
                            >
                              Start Secure Chat
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <h2 className="text-3xl font-bold text-foreground mb-4">Live Chat</h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      Jump into an instant conversation. Perfect for quick questions, brainstorming sessions, or when you need immediate conversation.
                    </p>
                  </div>
                  
                  <div className="space-y-6">
                    <motion.button
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      onClick={() => setDialogOpen(true)}
                      className="w-full bg-gradient-to-r from-primary to-primary/90 text-primary-foreground py-4 px-8 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 group/btn"
                    >
                      <Zap className="w-6 h-6 group-hover/btn:animate-pulse" />
                      Start Live Chat
                      <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </motion.button>
                    
                    <div className="bg-muted/50 rounded-2xl p-6 space-y-3">
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Clock className="w-5 h-5 text-primary" />
                        <span className="font-medium">Available Monday - Friday</span>
                      </div>
                      <div className="text-muted-foreground pl-8">
                        <p className="font-mono text-lg">9:00 AM - 5:00 PM EST</p>
                      </div>
                      <div className="flex items-center gap-2 pl-8">
                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm text-green-600 font-medium">Usually online</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={cardVariants}
              whileHover="hover"
              className="group"
            >
              <div className="bg-card/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-border/50 h-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="text-center mb-8">
                    <motion.div
                      variants={iconVariants}
                      whileHover="hover"
                      className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 mb-6 shadow-lg"
                    >
                      <Mail className="w-10 h-10 text-primary-foreground" />
                    </motion.div>
                    <h2 className="text-3xl font-bold text-foreground mb-4">Send Email</h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      Share detailed project requirements, attach files, or simply introduce yourself. I'll respond with a thoughtful reply.
                    </p>
                  </div>
                  
                  <div className="space-y-6">
                    <motion.a
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      href="mailto:your-email@example.com"
                      className="w-full bg-gradient-to-r from-primary to-primary/90 text-primary-foreground py-4 px-8 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 group/btn"
                    >
                      <Mail className="w-6 h-6 group-hover/btn:animate-bounce" />
                      Compose Email
                      <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </motion.a>
                    
                    <div className="bg-muted/50 rounded-2xl p-6 space-y-3">
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Clock className="w-5 h-5 text-primary" />
                        <span className="font-medium">Response within 24 hours</span>
                      </div>
                      <div className="text-muted-foreground pl-8">
                        <p>Available for asynchronous communication</p>
                      </div>
                      <div className="flex items-center gap-2 pl-8">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="text-sm text-blue-600 font-medium">Detailed responses guaranteed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ContactHome