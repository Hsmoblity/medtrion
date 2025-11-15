import Link from 'next/link'
import React from 'react'

type Props = {
  children?: React.ReactNode
  className?: string
  asButton?: boolean
}

export default function ConsultButton({ children = 'Request Consultation', className = '', asButton = false }: Props) {
  const href = '/consultation/google-form'
  if (asButton) {
    return (
      <Link href={href} legacyBehavior>
        <a className={className} role="button">
          {children}
        </a>
      </Link>
    )
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  )
}
