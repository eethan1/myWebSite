import {Fragment, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import axios from 'axios'
function Login() {
  const navigate = useNavigate()
  const [accountInput, setAccountInput] = useState({username: '', password: ''})
  const handleSubmit = (e) => {
    console.log(`Register&Login as ${accountInput.username}`)
    const av = document.querySelector('input[type=file]').files[0]
    const reader = new FileReader()

    reader.readAsDataURL(av)
    reader.addEventListener('load', async () => {
      const avatar = reader.result
      console.log(`length= ${avatar.length}`)
      const resp = await axios.post('/api/login', {...accountInput, avatar})
      console.log(resp)
      navigate('/')
    })
    e.preventDefault()
  }
  const handleInputChange = ({target: {name, value}}) => {
    setAccountInput((prev) => ({...prev, [name]: value}))
  }

  return (
    <Fragment>
      <p> Login/Register </p>
      <form>
        <input name='username' placeholder='username' onChange={handleInputChange}></input>
        <input type='password' name='password' placeholder='password' onChange={handleInputChange}></input>
        <label htmlFor='avatar'>Avatar</label>
        <input type='file' name='avatar'></input>
        <input type='submit' onClick={handleSubmit}></input>
      </form>
    </Fragment>
  )
}

export default Login
