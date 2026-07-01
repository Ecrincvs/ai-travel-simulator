import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import { HomePage } from './components/HomePage'
import { TripPlanner } from './components/TripPlanner'
import { SavedTripsPage } from './components/SavedTripsPage'
import { BudgetCalculatorPage } from './components/BudgetCalculatorPage'
import { useLocalStorage } from './hooks/useLocalStorage'
import type { SavedPlan } from './types'

/**
 * "Back" that mirrors the browser's back button when there's in-app history,
 * and falls back to Home on a direct load / first-entry refresh so the user is
 * never stranded outside the app.
 */
function useAppBack() {
  const navigate = useNavigate()
  return () => {
    const idx = (window.history.state?.idx as number | undefined) ?? 0
    if (idx > 0) navigate(-1)
    else navigate('/')
  }
}

function HomeRoute() {
  const navigate = useNavigate()
  return (
    <HomePage
      onPlan={(city) =>
        navigate(
          city ? `/planner?city=${encodeURIComponent(city)}` : '/planner',
        )
      }
      onOpenSaved={() => navigate('/saved')}
      onOpenBudget={() => navigate('/budget')}
    />
  )
}

function PlannerRoute() {
  const back = useAppBack()
  const [params] = useSearchParams()
  const [plans] = useLocalStorage<SavedPlan[]>('ats-plans', [])
  const planId = params.get('plan') ?? ''
  const city = params.get('city') ?? ''
  const initialPlan = planId
    ? plans.find((p) => p.id === planId)
    : undefined
  return (
    <TripPlanner
      key={planId || city || 'new'}
      initialCity={city}
      initialPlan={initialPlan}
      onBack={back}
    />
  )
}

function SavedRoute() {
  const navigate = useNavigate()
  const back = useAppBack()
  return (
    <SavedTripsPage
      onBack={back}
      onOpen={(plan) => navigate(`/planner?plan=${encodeURIComponent(plan.id)}`)}
      onNew={() => navigate('/planner')}
    />
  )
}

function BudgetRoute() {
  const back = useAppBack()
  return <BudgetCalculatorPage onBack={back} />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/planner" element={<PlannerRoute />} />
      <Route path="/saved" element={<SavedRoute />} />
      <Route path="/budget" element={<BudgetRoute />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
