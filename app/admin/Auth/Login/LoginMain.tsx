'use client'
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from 'sonner'
import SetQuickToken from '@/app/Auth/Functions/SetQuickToken'
import { useRouter } from 'next/navigation'
import { Loader, Loader2 } from 'lucide-react'

interface LoginMainProps {
    token: string
}

const LoginMain = ({token}: LoginMainProps) => {
  let nav = useRouter()
  const [formData, setFormData] = useState({
    password: '',
    ipAddress: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const validateIPAddress = (ip: string) => {
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
    if (!ipv4Regex.test(ip)) {
      return false
    }
    const parts = ip.split('.')
    return parts.every(part => {
      const num = parseInt(part)
      return num >= 0 && num <= 255
    })
  }

  const handleSubmit = async(e: React.MouseEvent) => {
    e.preventDefault()
    
    if (!formData.password) {
      toast.error('Password is required')
      return
    }
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    // Validate IP address
    if (!formData.ipAddress) {
      toast.error('IP Address is required')
      return
    }
    if (!validateIPAddress(formData.ipAddress)) {
      toast.error('Please enter a valid IP address (e.g., 192.168.1.1)')
      return
    }

    setIsLoading(true)

    let qt = await SetQuickToken(`admin_token`, `${token}`, [], [], false, true)

    if(!qt) return;
    // Validate password
    // If validation passes
    let res = await fetch('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify(formData),
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    let data = await res.text()

    if(!res.ok){
      toast.error(data)
      setIsLoading(false)
      return;
    }
    
    toast.success(data)
    // setIsLoading(false)
    setTimeout(() => window.location.reload(), 2000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(isLoading) {
      toast.info(`Please wait for your request to be processed...`)
      return;
    };
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8  relative overflow-hidden ${isLoading ? `dis` : ``}`}>
      {/* <div className="absolute inset-0 opacity-20" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%239CA3AF\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"1\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"}}></div> */}
      
      <div className="absolute top-10 left-10 w-72 h-72 bg-chart-2/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-chart-2/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <Card className="w-full max-w-md backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl hover:shadow-chart-2/20 transition-all duration-300 hover:scale-[1.02] relative z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-chart-2/10 to-chart-2/10 rounded-lg blur-xl"></div>
        <CardHeader className="relative z-10">
          <div className="w-16 h-16 mx-auto mb-4 bg-chart-2 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Admin Portal
          </CardTitle>
          <CardDescription className="text-center text-gray-300/80 text-base">
            Secure access to administrative controls
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="group">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="h-12 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-indigo-400 focus:ring-indigo-400/30 backdrop-blur-sm transition-all duration-300 group-hover:bg-white/10"
                />
              </div>
              <div className="group">
                <Input
                  id="ipAddress"
                  name="ipAddress"
                  type="text"
                  required
                  placeholder="IP Address (e.g., 192.168.1.1)"
                  value={formData.ipAddress}
                  onChange={handleChange}
                  className="h-12 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-indigo-400 focus:ring-indigo-400/30 backdrop-blur-sm transition-all duration-300 group-hover:bg-white/10"
                />
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              className={`w-full h-12 bg-chart-2 hover:bg-chart-2/80 text-white font-semibold rounded-lg shadow-lg hover:shadow-chart-2/25 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] border-0 ${isLoading ? 'dis' : ''}`}
              disabled={isLoading}
            >
              {
                !isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      Access Dashboard
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Loader size={20} className="w-4 h-4 animate-spin" />
                  </span>
                )
              }
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginMain