/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
const select_image = require('./select_image');
const image_processing = require('./image_processing');
const gcs = require('./gcs');


exports.sendImageUrl = (req, res) => {
  (async () => {

    const text = req.body.text || '';

    const img_paths = await select_image(text);
    const promises = [image_processing.load_img(img_paths), image_processing.make_text_img(text)];
    const result = await Promise.all(promises).then((results) => { return results });
    const diary_img = await image_processing.concat_img(result[0], result[1]);
        
    const filename = Date.now() + ".png"
    const file_path = process.env['ENV'] +'/diary/' + filename;
    
    await gcs.uploadToGCS(diary_img, file_path)
          .then( () => {
            res.status(200).json({
              "url": gcs.getPublicUrl(file_path)
            });
          })
          .catch( (err) => {
            console.log(err);
          })
  })().catch();
};
