require('dotenv').config()
const S3 = require('aws-sdk/clients/s3')
const fs = require('fs')

const bucketName= process.env.AWS_BUCKET_NAME
const region = process.env.AWS_BUCKET_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
const s3 = new S3({
region,
accessKeyId,
secretAccessKey
})

//upload file to s3 bucket

function uploadFile(file,path){
    //const fileStream = fs.createReadStream(file)
    const uploadParams = {
        Bucket : bucketName,
        Body : file.buffer,
        Key: `${path}/${file.filename}`,

        //Key : file.filename
    }
    
    //console.log(uploadParams)
    return s3.upload(uploadParams).promise()
}

exports.uploadFile = uploadFile
