import fs, { readFileSync } from 'fs'
import AWS from "aws-sdk"
export const uploadFile = (user,filename) => {

    const s3 = new AWS.S3({
        accessKeyId: "AKIA3PB635A3BYABABOA",
        secretAccessKey: "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"
    })

    const file = readFileSync(filename)

    const params = {
        Bucket: "timeline-cloud",
        Key: `${user}/email/${filename}`,
        Body: file,
        ContentType: "text/html"
    }

    s3.upload(params,(err,data) => {
        if(err){
            console.log(err);
        }
        else{
            console.log("File uploaded successfully")
        }
    })
    fs.unlink(filename,function(err){
        if(err){
            console.log("Error deleting the file")
        }
    })
}


export const deleteFile = (user,filename) => {

    const s3 = new AWS.S3({
        accessKeyId: "AKIA3PB635A3BYABABOA",
        secretAccessKey: "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"
    })

     const params = {
        Bucket: "timeline-cloud",
        Key: `${user}/email/${filename}`,
       
    }

    s3.deleteObject(params,(err,data) => {
        if(err){
            console.log(err);
        }
        else{
            console.log("File deleted successfully")
        }
    })
    
}