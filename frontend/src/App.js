import logo from './logo.svg'
import './App.css'
import {useState} from 'react'

function App() {
  const [msgs, setMsgs] = useState([])
  const [msg, setMsg] = useState('')
  const appendMsg = (e) => {
    if (e.keyCode === 13) {
      console.log(msgs)
      setMsgs((prev) => {
        const r = [...prev, msg]
        setMsg('')
        return r
      })
    }
  }

  return (
    <div className='App'>
      <div className='sect' id='d-title'>
        <h1 className='center'>Y G G d 2 m i r</h1>
      </div>
      <div id='d-selfie'>
        <img id='selfie' src='img/selfie.jpg' className='center'></img>
      </div>
      <div id='d-intro' className='sect'>
        <p>Hi I'm Cjiso1117</p>
        <p>Web is so fun.</p>
      </div>
      <div className='sect chatbox'>
        <div>
          <input
            id='msgInput'
            name='msg'
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={appendMsg}
            placeholder='Leave something?'
          ></input>
        </div>
        <div className='center'>
          {msgs.map((msg, i) => (
            <p key={`msg-${i}`}> {msg} </p>
          ))}
        </div>
      </div>
      <div>
        <p> Visitor: {msgs.length}</p>
      </div>
    </div>
  )
}

export default App
