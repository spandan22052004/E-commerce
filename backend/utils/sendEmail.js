const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, html) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        const mailOptions = {
            from : process.env.EMAIL_USER,
            to,
            subject,
            html
        };
        await transporter.sendMail(mailOptions);
    }catch(error){
        console.error("Error Sending email :",error);
    }
}

module.exports = sendEmail;