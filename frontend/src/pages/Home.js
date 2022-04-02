import {Fragment, useEffect, useState} from 'react'
import axios from 'axios'
function Home() {
  const [msgs, setMsgs] = useState({})
  const [msg, setMsg] = useState('')
  const deleteMsg = async (mid) => {
    await axios.delete(`/api/messages/${mid}`)
    setMsgs((prev) => {
      const r = {...prev}
      delete r[mid]
      return r
    })
  }
  useEffect(async () => {
    const resp = await axios.get('/api/messages')
    setMsgs(resp.data)
  }, [])
  const appendMsg = async (e) => {
    if (e.keyCode === 13) {
      console.log(msgs)

      const resp = await axios.post('/api/messages', {message: msg})
      setMsgs((prev) => {
        const r = {...prev, ...resp.data.message}
        setMsg('')
        return r
      })
    }
  }
  return (
    <Fragment>
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
          {Object.keys(msgs).map((mid) => (
            <div key={`msg-${mid}`}>
              <img src={msgs[mid].avatar} alt='avatar' height='150' width='200'></img>
              <p> {msgs[mid].message} </p>
              <button onClick={() => deleteMsg(mid)}>delete</button>
            </div>
          ))}
        </div>
      </div>
      <div>
        <p> Visitor: {Object.keys(msgs).length}</p>
      </div>
    </Fragment>
  )
}

export default Home
