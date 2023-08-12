const express = require('express')
const User = require('../models/users')
const router = new express.Router()
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail, sendCancellationEmail } = require('../emails/account')


router.post('/users', async (req,res) => {
    const user = new User(req.body)
    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({success: true, data:{user, token}})
    } catch (e) {
        res.status(400).send({success: false, message: e.message})
    }
})

router.post('/users/login', async (req,res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({success: true, data:{user, token}})
    } catch(error) {
        res.status(400).send({success: false, ...error})
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => token.token !== req.token)
        await req.user.save()
        res.send({success: true, message: 'Logged out successfully.'})
    } catch (e) {
        res.status(500).send({success: false, error: e})
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send({success: true, message: 'Logged out of all sessions successfully.'})
    } catch (e) {
        res.status(500).send( {success: false, error: e})
    }
})

router.get('/users/me', auth, async (req, res) => {
    res.send({success: true, data: req.user})
})

router.patch('/users/me', auth, async (req, res) => {
    const Updates = Object.keys(req.body)
    const AllowedUpdates = ['name', 'age', 'email', 'password']
    const isValidOperation = Updates.every(update => AllowedUpdates.includes(update))
    if(!isValidOperation) return res.status(400).send({success: false, error: "invalid updates"})
    try {
        // const user = await User.findById(req.params.id)
        Updates.forEach(update=>req.user[update] = req.body[update])
        await req.user.save()
        // const user = await User.findByIdAndUpdate(req.params.id, req.body, {new:true, runValidators:true})
        res.send({ success: true, data: req.user})
    } catch (e) {
        res.status(400).send({ success: false, error: e})
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        // const user = await User.findByIdAndDelete(req.user._id)
        // if(!user) return res.status(404).send()
        await req.user.remove()
        sendCancellationEmail(req.user.email, req.user.name)
        res.send({ success: true, message: 'User deleted successfully.', data: req.user})
    } catch (e) {
        res.status(500).send({ success: false, error: e})
    }
})

const upload = multer({
    // dest: 'avatars',
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpeg|png|jpg)$/))
        {
            return cb(new Error('Please upload png/jpg/jpeg image'))
        }
        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar') , async (req, res, next) => {
    try {
        const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
        req.user.avatar = buffer
        await req.user.save()
        res.send({success: true, message: 'Avatar uploaded successfully.'})
    } catch (error) {
        next(error)
    }
}, (error, req, res, next) => {
    res.status(400).send({success: false, message: error.message})
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send({success: true, message: 'Avatar deleted successfully.'})
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if(!user || !user.avatar) 
        throw new Error()

        res.set('Content-Type',  'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send({success: false, error: e})
    }
})

router.post('/users/me/feedback', auth, async (req, res) => {
    try {
        console.log(req.body)
        // const user = req.user
        // user.feedback = req.body.feedback
        // await user.save()
        res.send({success: true, message: 'Feedback submitted successfully.'})
    } catch (e) {
        res.status(500).send({success: false, error: e})
    }
})


module.exports = router