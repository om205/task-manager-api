const express = require('express')
const router = new express.Router()

const html = `
    <html>
        <head>
            <title>Task Manager Api</title>
            <style>
                body {
                    align-items: center;
                    background-color: mintcream;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }
            </style>
        </head>
        <body>
            <h1>Welcome to Task Manager App</h1>
            <h2>created by OM DUBEY</h2>
            <a href="https://documenter.getpostman.com/view/23486291/2s83zgtjrn">View Documentation</a>
        </body>
    </html>`

router.get('/', (req, res) => {
    res.send(html)
})

module.exports = router