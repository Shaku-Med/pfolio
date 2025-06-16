'use client'
import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Bot, CheckCircle, Shield, Zap } from 'lucide-react';
import { DeviceFingerprintGenerator } from '../../components/NoLibrary/FingerPrint';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { ContextProvider } from '@/components/Context/ContextProvider';
const Check: React.FC = () => {
  const [isVerifying, setIsVerifying] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [uniqueId, setUniqueId] = useState<string>('');
  const { fingerPrint } = useContext(ContextProvider);

  let nav = useRouter()
  const verificationSteps: string[] = [
    'Initializing verification...',
    'Checking unique ID...',
    'Validating credentials...',
    'Finalizing verification...'
  ];

  useEffect(() => {
    const verifyId = async () => {
        try {
            if(!fingerPrint) return;
            const fingerprint = await fingerPrint.generateFingerprint();

            if (fingerprint) {
              const id = fingerPrint.generateUniqueId(fingerprint);
              setUniqueId(id);
              // Set cookie with 1 year expiration
              Cookies.set('id', id, { expires: 365, path: '/' });
            }
        }
        catch (e) {
            console.log(e)
        }
    };
    verifyId();

    const timer = setInterval(() => {
      setProgress((prev: number) => {
        const newProgress = prev + 8;
        const stepIndex = Math.floor(newProgress / 25);
        setCurrentStep(Math.min(stepIndex, verificationSteps.length - 1));
        
        if (newProgress >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setIsVerifying(false)
            setTimeout(() => {
                if(Cookies.get(`id`)){
                    window.location.reload()
                }
                else {
                    verifyId()
                }
            }, 800)
          }, 800);
          return 100;
        }
        return newProgress;
      });
    }, 200);

    return () => clearInterval(timer);
  }, [fingerPrint]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_70%)] opacity-20 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] animate-pulse" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--secondary)_0%,transparent_70%)] opacity-10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] animate-[pulse_3s_ease-in-out_infinite]" />
      <motion.div 
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_70%)] opacity-5"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.05, 0.1, 0.05],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative bg-card/80 backdrop-blur-xl border border-border rounded-3xl shadow-2xl p-10 max-w-lg w-full"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-3xl" />
        
        <div className="relative text-center space-y-8">
          <motion.div
            className="relative inline-flex items-center justify-center"
            animate={{ 
              rotate: isVerifying ? [0, 360] : 0,
              scale: isVerifying ? [1, 1.05, 1] : [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 3, repeat: isVerifying ? Infinity : 0, ease: "linear" },
              scale: { duration: 0.6, ease: "easeInOut" }
            }}
          >
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl scale-150" />
            <div className="relative bg-primary/10 p-6 rounded-full border border-primary/20">
              {isVerifying ? (
                <Bot className="w-12 h-12 text-primary" />
              ) : (
                <Shield className="w-12 h-12 text-emerald-500" />
              )}
            </div>
            {isVerifying && (
              <motion.div
                className="absolute inset-0 border-2 border-primary/40 rounded-full"
                animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            )}
          </motion.div>
          
          <div className="space-y-4">
            <motion.h2 
              className="text-3xl font-bold text-foreground tracking-tight"
              key={isVerifying ? 'verifying' : 'complete'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {isVerifying ? 'ID Verification' : 'Verification Complete'}
            </motion.h2>
            
            <motion.p 
              className="text-muted-foreground text-lg leading-relaxed"
              key={currentStep}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {isVerifying 
                ? verificationSteps[currentStep]
                : `Access granted - Your unique ID: ${uniqueId}`}
            </motion.p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span className="font-mono">{Math.round(progress)}%</span>
            </div>
            
            <div className="relative h-3 bg-secondary/50 rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/80 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
              </motion.div>
            </div>
          </div>
          
          {!isVerifying && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
              className="flex items-center justify-center space-x-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl"
            >
              <CheckCircle className="w-6 h-6 text-emerald-500" />
              <span className="text-emerald-500 font-medium">Verification Successful</span>
              <Zap className="w-5 h-5 text-emerald-500" />
            </motion.div>
          )}
          
          {isVerifying && (
            <div className="flex justify-center space-x-2">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-primary rounded-full"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Check;