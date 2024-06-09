import axios from '@/lib/axios'
import { AxiosError, AxiosResponse } from 'axios'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, type Dispatch, type SetStateAction } from 'react'
import useSWR from 'swr'

export type User = {
    id: number
    name: string
    email: string
    created_at: string
    updated_at: string
    email_verified_at: string | undefined
}

export type RegisterError = {
    name: string[]
    email: string[]
    password: string[]
    password_confirmation: string[]
}

export type LoginError = {
    email: string[]
    password: string[]
}

export type ForgotPasswordError = {
    email: string[]
}

export type ResetPasswordError = {
    email: string[]
    password: string[]
    password_confirmation: string[]
}

type Props = {
    middleware?: 'guest' | 'auth'
    redirectIfAuthenticated?: string
}

export const useAuth = ({
    middleware,
    redirectIfAuthenticated,
}: Props = {}) => {
    const router = useRouter()
    const params = useParams()

    const {
        data: user,
        error,
        mutate,
    } = useSWR<User | void, Error | AxiosError>('/api/user', async () => {
        return await axios
            .get<User>('/api/user')
            .then(res => res.data)
            .catch((error: { response: AxiosResponse }) => {
                if (error.response.status !== 409) throw error

                router.push('/verify-email')
            })
    })

    const csrf = () => axios.get('/sanctum/csrf-cookie')

    const register = async ({
        setErrors,
        ...props
    }: {
        name: string
        email: string
        password: string
        password_confirmation: string
        setErrors?: Dispatch<SetStateAction<RegisterError | undefined>>
    }) => {
        await csrf()

        setErrors?.(undefined)

        axios
            .post('/register', props)
            .then(() => mutate())
            .catch(
                (error: {
                    response: AxiosResponse<{ errors: RegisterError }>
                }) => {
                    if (error.response.status !== 422) throw error

                    setErrors?.(error.response.data.errors)
                },
            )
    }

    const login = async ({
        setErrors,
        setStatus,
        ...props
    }: {
        setErrors?: Dispatch<SetStateAction<LoginError | undefined>>
        setStatus?: Dispatch<SetStateAction<string | undefined>>
        email: string
        password: string
        remember?: boolean
    }) => {
        await csrf()

        setErrors?.(undefined)
        setStatus?.(undefined)

        axios
            .post('/login', props)
            .then(() => mutate())
            .catch(
                (error: {
                    response: AxiosResponse<{ errors: LoginError }>
                }) => {
                    if (error.response.status !== 422) throw error

                    setErrors?.(error.response.data.errors)
                },
            )
    }

    const forgotPassword = async ({
        setErrors,
        setStatus,
        email,
    }: {
        setErrors?: Dispatch<SetStateAction<ForgotPasswordError | undefined>>
        setStatus?: Dispatch<SetStateAction<string | undefined>>
        email: string
    }) => {
        await csrf()

        setErrors?.(undefined)
        setStatus?.(undefined)

        axios
            .post('/forgot-password', { email })
            .then((response: AxiosResponse<{ status: string }>) =>
                setStatus?.(response.data.status),
            )
            .catch(
                (error: {
                    response: AxiosResponse<{ errors: ForgotPasswordError }>
                }) => {
                    if (error.response.status !== 422) throw error

                    setErrors?.(error.response.data.errors)
                },
            )
    }

    const resetPassword = async ({
        setErrors,
        setStatus,
        ...props
    }: {
        setErrors?: Dispatch<SetStateAction<ResetPasswordError | undefined>>
        setStatus?: Dispatch<SetStateAction<string | undefined>>
        email: string
        password: string
        password_confirmation: string
    }) => {
        await csrf()

        setErrors?.(undefined)
        setStatus?.(undefined)

        axios
            .post('/reset-password', { token: params.token, ...props })
            .then((response: AxiosResponse<{ status: string }>) =>
                router.push('/login?reset=' + btoa(response.data.status)),
            )
            .catch(
                (error: {
                    response: AxiosResponse<{ errors: ResetPasswordError }>
                }) => {
                    if (error.response.status !== 422) throw error

                    setErrors?.(error.response.data.errors)
                },
            )
    }

    const resendEmailVerification = ({
        setStatus,
    }: {
        setStatus?: Dispatch<SetStateAction<string | undefined>>
    }) => {
        void axios
            .post('/email/verification-notification')
            .then((response: AxiosResponse<{ status: string }>) =>
                setStatus?.(response.data.status),
            )
    }

    const logout = async () => {
        if (!error) {
            await axios.post('/logout').then(() => mutate())
        }

        window.location.pathname = '/login'
    }

    useEffect(() => {
        if (middleware === 'guest' && redirectIfAuthenticated && user)
            router.push(redirectIfAuthenticated)
        if (
            window.location.pathname === '/verify-email' &&
            user?.email_verified_at &&
            redirectIfAuthenticated
        )
            router.push(redirectIfAuthenticated)
        if (middleware === 'auth' && error) void logout()
    }, [user, error])

    return {
        user,
        register,
        login,
        forgotPassword,
        resetPassword,
        resendEmailVerification,
        logout,
    }
}
