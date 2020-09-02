/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
const select_image = require('./select_image');
const image_processing = require('./image_processing');
const gcs = require('./gcs');
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Image} = require('dialogflow-fulfillment');



exports.sendImageApi = functions.https.onRequest((req, res) => {
  const agent = new WebhookClient({ req, res });

  async function SendImage(agent){
    await agent.add(new Image({
      imageUrl: "https://storage.googleapis.com/travel-diary_bucket/development/diary/1599019574933.png",
    })
  );
  };

  async function SendImageTest(agent){
  
    let text = req.body["queryResult"]["parameters"]["text"]  || '';

    let img_paths = await select_image(text); // TODO: select_imageの引数は変更要
    let append_content_img_lists = await image_processing.load_img(img_paths);
    let append_text_img_buf_lists =  await image_processing.make_text_img(text);
    let diary_img = await image_processing.concat_img(append_content_img_lists, append_text_img_buf_lists);
        
    const filename = Date.now() + ".png"
    const file_path = process.env['ENV'] +'/diary/' + filename;
    
    await gcs.uploadToGCS(diary_img, file_path)
          .then( () => {

            console.log("pass");

            agent.add(new Image({
              imageUrl: gcs.getPublicUrl(file_path),
            })
          );    

            // res.send(
            //   JSON.stringify({
            //     "line": {
            //       "type": "image",
            //       "originalContentUrl": gcs.getPublicUrl(file_path),
            //       "previewImageUrl": gcs.getPublicUrl(file_path),
            //       "animated": false
            //     }
            //   })
            // );

          })
          .catch( (err) => {
            // res.status(500).json({
            //   "error": err
            // });
          })
  
  }

  let intentMap = new Map();
  intentMap.set('StartTextIntent.yes.SendImageIntent', SendImage);
  agent.handleRequest(intentMap);
});
