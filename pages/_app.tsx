import { NextPage } from 'next'
import { AppProps } from 'next/app'
import Head from 'next/head'
import { Inter } from 'next/font/google'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import dynamic from 'next/dynamic'
const Navigation = dynamic(() => import('@/components/navigation').then(m => m.Navigation), { ssr: false })
const Header = dynamic(() => import('@/components/header').then(m => m.Header), { ssr: false })
import { SidebarProvider, useSidebar } from '@/contexts/sidebar-context'
import { cn } from '@/lib/utils'
import '@/styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

function MainContent({ Component, pageProps }: { Component: AppProps['Component']; pageProps: AppProps['pageProps'] }) {
  const { shouldExpand } = useSidebar()
  
  return (
    <div className={cn(
      "flex-1 flex flex-col transition-all duration-300 ease-in-out",
      shouldExpand ? "sm:ml-[200px]" : "sm:ml-14",
      "min-w-0" // Prevent content overflow
    )}>
      <Header />
      <main 
        className="flex-1 overflow-auto min-w-0"
        id="main-content"
        tabIndex={-1}
      >
        <Component {...pageProps} />
      </main>
    </div>
  )
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <SidebarProvider>
          <div className={inter.className}>
            <Head>
              <meta name="viewport" content="width=device-width, initial-scale=1" />
              <meta name="theme-color" content="#0f172a" />
              <meta name="description" content="Pemwa Payroll — modern Kenyan payroll management: employees, payroll runs, payslips, remittances, and compliance." />
              <meta property="og:title" content="Pemwa Payroll" />
              <meta property="og:description" content="Modern Kenyan payroll management platform" />
            </Head>
            <div className="relative flex min-h-screen">
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-3 focus:py-2 focus:rounded-md focus:bg-primary focus:text-primary-foreground"
              >
                Skip to content
              </a>
              <Navigation />
              <MainContent Component={Component} pageProps={pageProps} />
            </div>
            <Toaster />
          </div>
        </SidebarProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}