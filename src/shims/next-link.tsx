import React from 'react'
import { Link as RRLink } from 'react-router-dom'

type Props = React.ComponentProps<typeof RRLink> & { href?: string }

const Link: React.FC<Props> = ({ href, to, children, ...rest }) => {
  const target = to || href || '/'
  return (
    <RRLink to={target as any} {...rest}>
      {children}
    </RRLink>
  )
}

export default Link


