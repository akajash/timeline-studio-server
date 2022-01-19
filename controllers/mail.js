import nodemailer from 'nodemailer'

const sendEmail = (options) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.hostinger.com',
        port: 465,
        secure:false,
        auth: {
            user: 'support@studio.timelinesuite.com',
            pass: 'Karthick310!'
        },
        tls: {
            rejectUnauthorized: false
          }
    })

    // console.log(process.env.EMAIL_SERVICE)
    // console.log(process.env.EMAIL_USERNAME)
    // console.log(process.env.EMAIL_PASSWORD)
    // console.log(process.env.EMAIL_FROM)


    const mailOptions = {
        from : 'support@studio.timelinesuite.com',
        to: options.to,
        subject: options.subject,
        html: options.text
    }

    transporter.sendMail(mailOptions, function(err,info){
        if(err){
            console.log(err)
        }
        else{
            console.log(info)
        }
    })
}

export default sendEmail