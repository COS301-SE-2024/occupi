import { useState } from 'react'
import './App.css'
import LoginForm from './Components/Login/LoginForm'
import OtpPage from './Components/otp-page/OtpPage'


function App() {
  const [count, setCount] = useState(0)

  return (
    
      <div>
       {/* <LoginForm /> */}
{/* <OtpComponent /> */}
<OtpPage />
    </div>
  )
}

export default App
