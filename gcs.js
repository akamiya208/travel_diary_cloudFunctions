// See https://googleapis.dev/nodejs/storage/latest/index.html

const {Storage} = require("@google-cloud/storage")

const GOOGLE_CLOUD_PROJECT = process.env['GOOGLE_CLOUD_PROJECT'];
const CLOUD_BUCKET = GOOGLE_CLOUD_PROJECT + '_bucket';

const storage = new Storage({
    projectId: process.env['PROJECT_ID']
});
const bucket = storage.bucket(CLOUD_BUCKET);

function getPublicUrl(file_path){
    return `https://storage.googleapis.com/${CLOUD_BUCKET}/${file_path}`;
}

async function uploadToGCS(img, file_path){
    
    const file = bucket.file(file_path);

    const stream = file.createWriteStream({
        metadata: {
            contentType: "image/png"
        },
        resumable: false
    })
    .end(await img.toBuffer())
    .on('error', function(err){
        console.log(err);
    })
    .on('finish', function(){

    });
}

module.exports = {
    uploadToGCS,
    getPublicUrl
};