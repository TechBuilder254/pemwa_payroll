import { useNavigate, useLocation, useParams } from 'react-router-dom'

export function useRouter() {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  return {
    pathname: location.pathname,
    query: params as Record<string, string>,
    push: (to: string) => navigate(to),
    replace: (to: string) => navigate(to, { replace: true }),
    back: () => navigate(-1),
  }
}


