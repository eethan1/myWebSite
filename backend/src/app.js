const app = require('express')()
const PORT = process.env.PORT || 3301

app.get('/', (req, res) => {
  res.send('HelloworlD')
})

app.listen(PORT, () => {
  console.log(`Running on ${PORT}`)
})
