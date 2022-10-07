const postmark = require('postmark')

const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY)

const sendWelcomeEmail = async (email, name) => {
    await client.sendEmail({
        "From": "20je0649@pe.iitism.ac.in",
        "To": email,
        "Subject": "Welcome from Manage Tasks",
        "HtmlBody": `<strong>Hello</strong> ${name}.<br>Welcome to <strong>Manage Tasks</strong><br>Let me know how you get along with the app.`,
        "TextBody": "Hello from Om Dubey! Let me know how you get along with the app.",
        "MessageStream": "outbound"
    })
    console.log(`sent welcome mail to ${email}`)
}

const sendCancellationEmail = async (email, name) => {
    await client.sendEmail({
        "From": "20je0649@pe.iitism.ac.in",
        "To": email,
        "Subject": "Sorry to see you go!",
        "HtmlBody": `Goodbye, ${name}, your account has been removed from our servers !<br>We are sorry to see you go ! Hope to see you back sometime soon. <br>Please tell us the reason for deletion of your account so that we may improve our services further for other users.`,
        "TextBody": "Sorry to see you go!Your account has been removed.",
        "MessageStream": "outbound"
    })
    console.log(`sent cancellation email to ${email}`)
}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}