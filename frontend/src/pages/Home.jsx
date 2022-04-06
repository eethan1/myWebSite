import {Fragment, useEffect, useState} from 'react'
import axios from 'axios'
function Home() {
  const [msgs, setMsgs] = useState({})
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const deleteMsg = async (mid) => {
    try {
      await axios.delete(`/api/messages/${mid}`)
      setMsgs((prev) => {
        const r = {...prev}
        delete r[mid]
        return r
      })
    } catch (e) {
      setErr(e.response.data.err)
      setTimeout(() => setErr(''), 2000)
    }
  }
  useEffect(async () => {
    const resp = await axios.get('/api/messages')
    setMsgs(resp.data)
  }, [])
  const appendMsg = async (e) => {
    if (e.keyCode === 13) {
      console.log(msgs)
      try {
        const resp = await axios.post('/api/messages', {message: msg})
        setMsgs((prev) => {
          const r = {...prev, ...resp.data.message}
          setMsg('')
          return r
        })
      } catch (e) {
        setErr(e.response.data.err)
        setTimeout(() => setErr(''), 2000)
      }
    }
  }
  return (
    <Fragment>
      <div className='sect center' id='d-title'>
        <h1>Y G G d 2 m i r</h1>
        <p> 4/7 new challenge ! </p>
        <p> \freeeeeee attack point/ </p>
      </div>
      <div className='sect'>
        <img id='selfie' src='img/selfie.jpg' className='center'></img>
      </div>
      <div className='center'>
        <p>Hi, I'm R10921A14</p>
        <p>Web is so fun OwO.</p>
        <p>CSS is so hard QAQ.</p>
        <p>grid is so good OuO.</p>
        <p>Gura is so cute uwu.</p>
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
          <p>{err ? err : ''}</p>
        </div>
        <div id='messages' className='center'>
          {Object.keys(msgs).map((mid) => (
            <div className='message' key={`msg-${mid}`}>
              <div>
                <p>{msgs[mid].username}</p>
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
