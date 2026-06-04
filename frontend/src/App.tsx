import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Live from './pages/Live'
import Login from './pages/Login'
import Register from './pages/Register'
import Account from './pages/Account'
import BetSlip from './pages/BetSlip'
import Deposit from './pages/Deposit'
import Withdraw from './pages/Withdraw'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/live" element={<Live />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/account" element={<Account />} />
          <Route path="/betslip" element={<BetSlip />} />
          <Route path="/deposit" element={<Deposit />} />
          <Route path="/withdraw" element={<Withdraw />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
