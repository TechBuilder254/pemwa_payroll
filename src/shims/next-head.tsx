import React from 'react'

const Head: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  // No-op shim for Next.js Head. In Vite SPA, meta tags can be handled with react-helmet if needed.
  return <>{children}</>
}

export default Head


