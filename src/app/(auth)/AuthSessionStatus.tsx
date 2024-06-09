import { HTMLAttributes } from 'react'

type Props = HTMLAttributes<HTMLDivElement> & {
    status?: string
    className?: string
}

const AuthSessionStatus = ({ status, className, ...props }: Props) => (
    <>
        {status && (
            <div
                className={`${className} font-medium text-sm text-green-600`}
                {...props}>
                {status}
            </div>
        )}
    </>
)

export default AuthSessionStatus
