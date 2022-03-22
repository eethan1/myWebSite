const express = require('express')
const path = require('path')
const app = express()
const PORT = process.env.PORT || 8000
console.log(__dirname)
const frontStatic = path.join(__dirname, '../../frontend/build')
app.use(express.static(frontStatic))
app.get('/hello', (req, res) => {
  res.send('HelloworlD')
})

app.get('*', (req, res) => {
  res.sendFile(frontStatic + '/index.html')
})

app.listen(PORT, () => {
  console.log(`Running on ${PORT}`)
})
