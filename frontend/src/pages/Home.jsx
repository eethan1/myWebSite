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
      <div className='sect'>
        <img id='selfie' src='img/selfie.jpg' className='center'></img>
      </div>
      <div className='center'>
        <p>Hi I'm Cjiso1117</p>
        <p>Web is so fun.</p>
        <p>CSS is so hard QAQ.</p>
      </div>
      <div id='chatbox' className='sect'>
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
        <div id='messages' className='center'>
          {Object.keys(msgs).map((mid) => (
            <div className='message' key={`msg-${mid}`}>
              <div>
                <img src={msgs[mid].avatar} alt='avatar' height='auto' width='150px'></img>
              </div>
              <div className='center content'>
                <p> {msgs[mid].message} </p>
              </div>
              <div className='center'>
                <button onClick={() => deleteMsg(mid)}>delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <footer>
          <p>comments: {Object.keys(msgs).length}</p>
        </footer>
      </div>
    </Fragment>
  )
}

export default Home
