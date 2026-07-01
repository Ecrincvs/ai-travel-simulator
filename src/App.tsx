import { useState } from 'react'
import { HomePage } from './components/HomePage'
import { TripPlanner } from './components/TripPlanner'
import { SavedTripsPage } from './components/SavedTripsPage'
import { BudgetCalculatorPage } from './components/BudgetCalculatorPage'
import type { SavedPlan } from './types'

type View = 'home' | 'planner' | 'saved' | 'budget'

function App() {
  const [view, setView] = useState<View>('home')
  const [plannerCity, setPlannerCity] = useState('')
  const [loadedPlan, setLoadedPlan] = useState<SavedPlan | undefined>(undefined)
  const [returnTo, setReturnTo] = useState<View>('home')

  const goToPlanner = (city = '') => {
    setLoadedPlan(undefined)
    setPlannerCity(city)
    setReturnTo('home')
    setView('planner')
    window.scrollTo({ top: 0 })
  }

  const openSaved = () => {
    setView('saved')
    window.scrollTo({ top: 0 })
  }

  const openBudget = () => {
    setView('budget')
    window.scrollTo({ top: 0 })
  }

  const openSavedPlan = (plan: SavedPlan) => {
    setLoadedPlan(plan)
    setReturnTo('saved')
    setView('planner')
    window.scrollTo({ top: 0 })
  }

  const newPlanFromSaved = () => {
    setLoadedPlan(undefined)
    setPlannerCity('')
    setReturnTo('saved')
    setView('planner')
    window.scrollTo({ top: 0 })
  }

  if (view === 'planner') {
    return (
      <TripPlanner
        key={loadedPlan?.id ?? 'new'}
        initialCity={plannerCity}
        initialPlan={loadedPlan}
        onBack={() => setView(returnTo)}
      />
    )
  }

  if (view === 'saved') {
    return (
      <SavedTripsPage
        onBack={() => setView('home')}
        onOpen={openSavedPlan}
        onNew={newPlanFromSaved}
      />
    )
  }

  if (view === 'budget') {
    return <BudgetCalculatorPage onBack={() => setView('home')} />
  }

  return (
    <HomePage
      onPlan={goToPlanner}
      onOpenSaved={openSaved}
      onOpenBudget={openBudget}
    />
  )
}

export default App
