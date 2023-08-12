const express = require('express')
const cors = require('cors')
require('./db/mongoose.js')
const UserRouter = require('./routers/user')
const TaskRouter = require('./routers/task')
const GuideRouter= require('./routers/documentation')

const app = express()
const port = process.env.PORT

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
  })
app.use(express.json())
app.use(UserRouter)
app.use(TaskRouter)
app.use(GuideRouter)

app.listen(port, () => console.log(`Server is up and running on port ${port}`))