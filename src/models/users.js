const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Task = require('./tasks')
const { Binary } = require('mongodb')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        validate(value) {
            if(!validator.isEmail(value))
            throw new Error(`Email is invalid!`)
        }
    },
    password: {
        type: String,
        trim: true,
        minLength: 7,
        required: true,
        validate(value) {
            // if(value.length<=6) 
            // throw new Error('Password must be more than 6 characters!')
            if(value.includes('password'))
            throw new Error(`Password shouldn't contain 'password'`)
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if(value<0) throw new Error('Age cannot be negative!')
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
},
{
    timestamps: true
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.method('toJSON', function() {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
})

userSchema.method('generateAuthToken', async function() {
    const user = this
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
})

//Syntax in tutorial is outdated
userSchema.static('findByCredentials', async (email, password) => {
    const user = await User.findOne({email})
    if(!user) throw {error:'not able to login'}
    // throw new Error('not able to login')
    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch) throw {error:'unable to login'}
    // throw new Error('unable to login')
    return user
})

//hash the plain text password before saving
userSchema.pre('save', async function(next) {
    const user = this

    if(user.isModified('password'))
    user.password = await bcrypt.hash(user.password, 8)

    next()
})

//delete user tasks on deleting user (could've just deleted after deleting user but middelware is good practice)
userSchema.pre('remove', async function(next) {
    const user = this

    await Task.deleteMany({ owner: user._id })

    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User

// const me = new User({
//     name: '  Om Dubey   ',
//     email: ' ramaj.com ',
//     password: '  ldfjahpasswordg; '
// })

// me.save().then(me => console.log(me))
// .catch(err => console.log(err))