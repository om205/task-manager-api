const mongoose = require('mongoose')
mongoose.connect(process.env.MONGODB_URL)





// const task1 = new Task({
//     description: `  start learning for midsem         `,
// })
// task1.save().then(() => console.log(task1))
// .catch(err => console.log(err))