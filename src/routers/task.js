const express = require('express')
const Task = require('../models/tasks')
const auth = require('../middleware/auth')
const router = new express.Router()


router.post('/tasks', auth, async (req, res) => {
    // const task = new Task(req.body)
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    try {
        await task.save()
        res.status(201).send({success: true, data: task})
    } catch (e) {
        res.status(400).send({success: false, error:e})
    }
})


//GET /tasks?completed=fase
//GET /tasks?limit=10&skip=20
router.get('/tasks', auth, async (req, res) => {
    try {
        // const tasks = await Task.find({ owner: req.user._id })
        // res.send(tasks)
        const match = {}
        const sort = {}
        const limit = parseInt(req.query.limit)
        const skip = parseInt(req.query.skip)
        if(req.query.completed)
        match.completed = req.query.completed === 'true'

        if(req.query.sortBy) {
            const parts = req.query.sortBy.split(':')
            sort[parts[0]] = parts[1] === 'desc' ?-1:1
        }
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit,
                skip,
                sort
            }
        })
        const totalCount = await Task.countDocuments(match);
        const currentPage = parseInt(skip / limit) + 1;
        res.send({ success: true, pagination: {totalCount, currentPage, limit}, data: req.user.tasks})
    } catch (e) {
        res.status(500).send({ success: false, error:e})
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        // const task = await Task.findById(_id)
        const task = await Task.findOne({ _id, owner: req.user._id })
        if(!task) return res.status(404).send({success: false, message: 'Task not found.'})
        res.send({success: true, data: task})
    } catch (e) {
        res.status(500).send({success: false, error:e})
    }
})



router.patch('/tasks/:id', auth, async (req, res) => {
    const Updates = Object.keys(req.body)
    const AllowedUpdates = ['description', 'completed']
    const isValidOperation = Updates.every(update => AllowedUpdates.includes(update))

    if(!isValidOperation) return res.status(400).send({error: 'invalid updates'})
    try {
        // const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators:true})
        // const task = await Task.findById(req.params.id)
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })

        if(!task) return res.status(400).send({ success: false, message: 'Task not found.'})
        Updates.forEach(update => task[update] = req.body[update])
        await task.save()
        res.send({success: true, data: task, message: 'Task updated successfully.'})
    } catch (e) {
        res.status(400).send({success: false, error:e})
    }
})


router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id:req.params.id, owner: req.user._id})
        if(!task) return res.status(404).send()
        res.send({ success: true, data: task, message: 'Task deleted successfully.'})
    } catch (e) {
        res.status(500).send({success: false, error:e})
    }
})

module.exports = router