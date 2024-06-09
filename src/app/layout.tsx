import '@/app/global.css'
import { ReactNode } from 'react'

export const metadata = {
    title: 'Laravel',
}

type Props = {
    children: ReactNode
}

const RootLayout = ({ children }: Props) => {
    return (
        <html lang="en">
            <body className="antialiased">{children}</body>
        </html>
    )
}

export default RootLayout
