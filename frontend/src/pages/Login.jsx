import {Fragment, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import axios from 'axios'
function Login() {
  const navigate = useNavigate()
  const [accountInput, setAccountInput] = useState({username: '', password: ''})
  const [err, setErr] = useState('')
  const handleSubmit = async (e) => {
    e.preventDefault()

    console.log(`Register&Login as ${accountInput.username}`)
    const av = document.querySelector('input[type=file]').files[0]
    if (av) {
      const reader = new FileReader()

      reader.readAsDataURL(av)
      reader.addEventListener('load', async () => {
        const avatar = reader.result
        console.log(`length= ${avatar.length}`)
        try {
          const resp = await axios.post('/api/login', {...accountInput, avatar})
          console.log(resp)
          navigate('/')
        } catch (e) {
          console.log(e.response)
          setErr(e.response.data.err)
          setTimeout(() => setErr(''), 2000)
        }
      })
    } else {
      try {
        const resp = await axios.post('/api/login', {...accountInput})
        console.log(resp)
        navigate('/')
      } catch (e) {
        console.log(e.response)
        setErr(e.response.data.err)
        setTimeout(() => setErr(''), 2000)
      }
    }
  }
  const handleInputChange = ({target: {name, value}}) => {
    setAccountInput((prev) => ({...prev, [name]: value}))
  }

  return (
    <Fragment>
      <div>
        <p> Login/Register </p>
        <p>{err ? err : ''}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <input name='username' placeholder='username' onChange={handleInputChange}></input>
        <input type='password' name='password' placeholder='password' onChange={handleInputChange}></input>
        <label htmlFor='avatar'>Avatar</label>
        <input type='file' name='avatar'></input>
        <input type='submit' name='submit'></input>
      </form>
    </Fragment>
  )
}

export default Login
