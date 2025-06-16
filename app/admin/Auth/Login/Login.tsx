import React from 'react'
import LoginMain from './LoginMain'
import SetToken from '@/app/Auth/IsAuth/Token/SetToken'
import { cookies } from 'next/headers'

interface LoginProps {}

const ERROR_MESSAGE = 'Admin Page is unavailable'
const TOKEN_EXPIRY = '1d'
const TOKEN_ALGORITHM = 'HS512'

const ErrorComponent: React.FC = () => (
    <div className='flex justify-center items-center h-screen'>
        <h1 className='text-2xl font-bold'>{ERROR_MESSAGE}</h1>
    </div>
)

const Login: React.FC<LoginProps> = async () => {
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get('id')?.value

        if (!userId) {
            return <ErrorComponent />
        }

        const encryptionKeys = [
            process.env.VAPID_PRIVATE_KEY,
            process.env.TOKEN3,
            userId
        ].filter(Boolean)

        if (encryptionKeys.length !== 3) {
            console.error('Missing required encryption keys')
            return <ErrorComponent />
        }

        const token = await SetToken({
            expiresIn: TOKEN_EXPIRY,
            algorithm: TOKEN_ALGORITHM,
        }, encryptionKeys, {
            id: userId
        })

        if (!token) {
            console.error('Failed to generate authentication token')
            return <ErrorComponent />
        }

        return <LoginMain token={token} />
    } catch (error) {
        console.error('Login error:', error)
        return <ErrorComponent />
    }
}

export default Login
