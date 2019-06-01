var nodeMailer = require('nodemailer')
require('dotenv').config();

let email = "armandonarcizoruedaperez@gmail.com"
let contraseña = "armando123"
let transporter = nodeMailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'armandonarcizoruedaperez@gmail.com',
        pass: 'armando123'
    }
})
let mailOptions = {
    // should be replaced with real recipient's account
    to: email,
    subject: "Recuperación de contraseña",
    text: "Tu nueva contraseña es: " + contraseña
};
transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log(error);
    }
    console.log('Message %s sent: %s', info.messageId, info.response);
})
