const express = require('express')
const app = express()
const port = 5000   

const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://ksw:8451@ksw.ye1kyd7.mongodb.net/?appName=ksw', {
}).then(() => console.log("----- MongoDB connected -----"))
  .catch(err => console.log(err));


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
