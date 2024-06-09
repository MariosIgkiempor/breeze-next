'use client'

import Loading from '@/app/(app)/Loading'
import Navigation from '@/app/(app)/Navigation'
import { useAuth } from '@/hooks/auth'
import { ReactNode } from 'react'

type Props = {
    children: ReactNode
}

const AppLayout = ({ children }: Props) => {
    const { user } = useAuth({ middleware: 'auth' })

    if (!user) {
        return <Loading />
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Navigation user={user} />

            <main>{children}</main>
        </div>
    )
}

export default AppLayout
