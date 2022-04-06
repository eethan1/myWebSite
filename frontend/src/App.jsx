import './App.css'
import {Link, Route, Routes} from 'react-router-dom'
import {Login, Home} from './pages'

function App() {
  return (
    <div className='App'>
      <div>
        <Link to='/'> Home </Link> | <Link to='/login'> Login </Link>
      </div>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
      </Routes>
    </div>
  )
}

export default App
