const express = require('express')
require('./db/mongoose.js')
const UserRouter = require('./routers/user')
const TaskRouter = require('./routers/task')
const GuideRouter= require('./routers/documentation')

const app = express()
const port = process.env.PORT


app.use(express.json())
app.use(UserRouter)
app.use(TaskRouter)
app.use(GuideRouter)

app.listen(port, () => console.log(`Server is up and running on port ${port}`))