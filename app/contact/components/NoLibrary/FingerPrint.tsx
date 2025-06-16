'use client'
interface DeviceFingerprint {
    userAgent: string;
    language: string;
    platform: string;
    screenResolution: string;
    timezone: string;
    colorDepth: number;
    pixelRatio: number;
    cookiesEnabled: boolean;
    doNotTrack: string | null;
    hardwareConcurrency: number;
    maxTouchPoints: number;
    canvas: string;
    webgl: string;
    audio: string;
    fonts: string[];
    plugins: string[];
    storage: {
      localStorage: boolean;
      sessionStorage: boolean;
      indexedDB: boolean;
    };
  }
  
  class DeviceFingerprintGenerator {
    private canvas: HTMLCanvasElement | null;
    private audioContext: AudioContext | null;
  
    constructor() {
      this.canvas = null;
      this.audioContext = null;
    }
  
    private getCanvas(): HTMLCanvasElement {
      if (!this.canvas && typeof document !== 'undefined') {
        this.canvas = document.createElement('canvas');
      }
      if (!this.canvas) {
        throw new Error('Canvas could not be created');
      }
      return this.canvas;
    }
  
    private generateCanvasFingerprint(): string {
      if (typeof document === 'undefined') return '';
      
      const canvas = this.getCanvas();
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';
  
      canvas.width = 200;
      canvas.height = 50;
  
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('Device fingerprint test', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('Device fingerprint test', 4, 17);
  
      return canvas.toDataURL();
    }
  
    private generateWebGLFingerprint(): string {
      if (typeof document === 'undefined') return '';
      
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) return '';
  
      const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
      const vendor = debugInfo ? (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : '';
      const renderer = debugInfo ? (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';
      
      return `${vendor}~${renderer}`;
    }
  
    private async generateAudioFingerprint(): Promise<string> {
      if (typeof window === 'undefined') return '';
      
      return new Promise((resolve) => {
        try {
          // Check if AudioContext is available
          if (!window.AudioContext && !(window as any).webkitAudioContext) {
            resolve('');
            return;
          }

          this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          
          // Check if the context is in suspended state
          if (this.audioContext.state === 'suspended') {
            resolve('');
            return;
          }

          const oscillator = this.audioContext.createOscillator();
          const analyser = this.audioContext.createAnalyser();
          const gain = this.audioContext.createGain();
          const scriptProcessor = this.audioContext.createScriptProcessor(4096, 1, 1);

          gain.gain.value = 0;
          oscillator.type = 'triangle';
          oscillator.frequency.value = 10000;

          oscillator.connect(analyser);
          analyser.connect(scriptProcessor);
          scriptProcessor.connect(gain);
          gain.connect(this.audioContext.destination);

          scriptProcessor.onaudioprocess = (e) => {
            const samples = e.inputBuffer.getChannelData(0);
            let sum = 0;
            for (let i = 0; i < samples.length; i++) {
              sum += Math.abs(samples[i]);
            }
            const audioFingerprint = sum.toString();
            
            if (this.audioContext && this.audioContext.state !== 'closed') {
              this.audioContext.close();
            }
            
            resolve(audioFingerprint);
          };

          oscillator.start();
        } catch (e) {
          // If any error occurs, just return an empty string
          resolve('');
        }
      });
    }
  
    private getAvailableFonts(): string[] {
      if (typeof document === 'undefined') return [];
      
      const testFonts = [
        'Arial', 'Arial Black', 'Arial Narrow', 'Arial Rounded MT Bold',
        'Calibri', 'Cambria', 'Cambria Math', 'Candara', 'Comic Sans MS',
        'Consolas', 'Constantia', 'Corbel', 'Courier New', 'Franklin Gothic Medium',
        'Garamond', 'Georgia', 'Helvetica', 'Impact', 'Lucida Console',
        'Lucida Sans Unicode', 'Microsoft Sans Serif', 'MS Gothic', 'MS PGothic',
        'MS UI Gothic', 'MV Boli', 'Palatino Linotype', 'Segoe Print', 'Segoe Script',
        'Segoe UI', 'Segoe UI Light', 'Segoe UI Semibold', 'Segoe UI Symbol',
        'Tahoma', 'Times', 'Times New Roman', 'Trebuchet MS', 'Verdana', 'Webdings', 'Wingdings'
      ];
  
      const baseFonts = ['monospace', 'sans-serif', 'serif'];
      const testString = 'mmmmmmmmmmlli';
      const testSize = '72px';
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
  
      const baseFontWidths: { [key: string]: number } = {};
      baseFonts.forEach(baseFont => {
        context.font = `${testSize} ${baseFont}`;
        baseFontWidths[baseFont] = context.measureText(testString).width;
      });
  
      return testFonts.filter(font => {
        return baseFonts.some(baseFont => {
          context.font = `${testSize} ${font}, ${baseFont}`;
          const width = context.measureText(testString).width;
          return width !== baseFontWidths[baseFont];
        });
      });
    }
  
    private getPlugins(): string[] {
      if (typeof navigator === 'undefined') return [];
      return Array.from(navigator.plugins).map(plugin => plugin.name);
    }
  
    private checkStorage(): { localStorage: boolean; sessionStorage: boolean; indexedDB: boolean } {
      if (typeof window === 'undefined') {
        return { localStorage: false, sessionStorage: false, indexedDB: false };
      }
      return {
        localStorage: (() => {
          try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return true;
          } catch {
            return false;
          }
        })(),
        sessionStorage: (() => {
          try {
            sessionStorage.setItem('test', 'test');
            sessionStorage.removeItem('test');
            return true;
          } catch {
            return false;
          }
        })(),
        indexedDB: 'indexedDB' in window
      };
    }
  
    async generateFingerprint(): Promise<DeviceFingerprint> {
      if (typeof window === 'undefined') {
        return {
          userAgent: '',
          language: '',
          platform: '',
          screenResolution: '',
          timezone: '',
          colorDepth: 0,
          pixelRatio: 0,
          cookiesEnabled: false,
          doNotTrack: null,
          hardwareConcurrency: 0,
          maxTouchPoints: 0,
          canvas: '',
          webgl: '',
          audio: '',
          fonts: [],
          plugins: [],
          storage: { localStorage: false, sessionStorage: false, indexedDB: false }
        };
      }
  
      const audioFingerprint = await this.generateAudioFingerprint();
  
      return {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        colorDepth: screen.colorDepth,
        pixelRatio: window.devicePixelRatio,
        cookiesEnabled: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack,
        hardwareConcurrency: navigator.hardwareConcurrency || 0,
        maxTouchPoints: navigator.maxTouchPoints || 0,
        canvas: this.generateCanvasFingerprint(),
        webgl: this.generateWebGLFingerprint(),
        audio: audioFingerprint,
        fonts: this.getAvailableFonts(),
        plugins: this.getPlugins(),
        storage: this.checkStorage()
      };
    }
  
    generateUniqueId(fingerprint: DeviceFingerprint): string {
      // Use the most stable device characteristics to generate a persistent ID
      const stableComponents = [
        fingerprint.hardwareConcurrency,
        fingerprint.maxTouchPoints,
        fingerprint.platform,
        fingerprint.screenResolution,
        fingerprint.colorDepth,
        fingerprint.pixelRatio
      ].join('|');
  
      // Create a hash of the stable components
      let hash = 0;
      for (let i = 0; i < stableComponents.length; i++) {
        const char = stableComponents.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
  
      // Convert to a positive hex string and ensure it's always 8 characters
      const hexHash = Math.abs(hash).toString(16).padStart(8, '0');
      return `${hexHash}`;
    }
  }
  
  export { DeviceFingerprintGenerator, type DeviceFingerprint };