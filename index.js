/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
const select_image = require('./select_image');
const { load_img, concat_img, make_text_img } = require('./image_processing');
const { uploadToGCS, getPublicUrl } = require('./gcs');


exports.sendImageApi = (req, res) => {
  (async () => {

    let text = req.body.text || '';

    const img_paths = await select_image(text); // TODO: select_imageの引数は変更要

    const promises = [load_img(img_paths), make_text_img(text)];
    const result = await Promise.all(promises).then((results) => { return results });
    const diary_img = await concat_img(result[0], result[1]);
        
    const filename = Date.now() + ".png"
    const file_path = process.env['ENV'] +'/diary/' + filename;
    
    await uploadToGCS(diary_img, file_path)
          .then( () => {
            res.status(200).json({
              "url": getPublicUrl(file_path)
            });
          })
          .catch( (err) => {
            console.log(err);
            // res.status(500).json({
            //   "error": err
            // });
          })
  })().catch();
};
