import React from 'react'

type Options = {
  ssr?: boolean
  loading?: React.ComponentType
}

export default function dynamic<T extends React.ComponentType<any>>(
  loader: () => Promise<{ default: T }> | Promise<T>,
  opts?: Options
) {
  const Lazy = React.lazy(async () => {
    const mod = await loader()
    // Support both module shapes
    // @ts-ignore
    return 'default' in mod ? (mod as any) : { default: mod as any }
  })
  const Loading = opts?.loading
  return (props: React.ComponentProps<T>) => (
    <React.Suspense fallback={Loading ? <Loading /> : null}>
      <Lazy {...props} />
    </React.Suspense>
  )
}


