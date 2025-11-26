import React from 'react'
import './App.css'
import 'mdb-react-ui-kit/dist/css/mdb.min.css'
import '@fortawesome/fontawesome-free/css/all.min.css'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Navigator from './shared/router'

const queryClient = new QueryClient()

const App = () => {
  return (
    <div className="App">
      <QueryClientProvider client={queryClient}>
        <Navigator />
      </QueryClientProvider>
    </div>
  )
}

export default App
