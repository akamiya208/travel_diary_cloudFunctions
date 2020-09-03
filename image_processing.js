// see https://blog.capilano-fw.com/?p=5744
// see https://sharp.pixelplumbing.com/
const { registerFont, createCanvas} = require('canvas');
const sharp = require('sharp');
const gcs = require('./gcs');
const axios = require('axios');

registerFont('./GenEiChikugoMin2-R.ttf', { family: 'GenEiChikugoMin2 Regular' })

function load_img(img_paths){
    const promises = []
        
    background_img_path = img_paths.pop();

    img_paths.map(img_path => {
        promises.push(
            axios({
                method: 'get',
                url: img_path,
                responseType: 'arraybuffer'
              })
            .then(function (response) {
                  return sharp(response.data);
            })
            .catch(function(err){
                console.log(err);
            })
        )
    });

    promises.push(
        gcs.downloadFromGCS(background_img_path)
            .then(function(buf){
                return sharp(buf);
            })
            .catch(function(err){
                console.log(err);
            })
    );

    return Promise.all(promises).then(
        (results) => { return results });
}

async function resize_img_by_width(sharp_lists, width){
    const promises = []

    sharp_lists.map(img => {
        promises.push(
            new Promise(async resolve => {
                img.resize(width)
                const img_metadata = await img.metadata();
                const buf = await img.toBuffer();

                resolve(
                    {
                        "buf": buf, 
                        "width": parseInt(width), 
                        "height": parseInt(width * img_metadata.height / img_metadata.width) 
                    }
                )
            })
        )
    });

    return Promise.all(promises).then(
        (results) => { return results });
}

async function concat_img(append_content_img_lists, append_text_img_buf_lists){
    background_im_lt = [32, 150]
    background_im_lb = [32, 700]
    background_im_rb = [762, 700]
    background_im_rt = [762, 150]
    background_im_height = background_im_lb[1] - background_im_lt[1]
    background_im_width = background_im_rt[0] - background_im_lt[0]

    diary_img = await append_content_img_lists.pop();

    content_imgs = await resize_img_by_width(append_content_img_lists, background_im_width * 0.6);

    diary_img.composite([
        {
            input: content_imgs[0]["buf"],
            top: background_im_lt[1],
            left: background_im_lt[0]
        },
        {
            input: content_imgs[1]["buf"],
            top: background_im_lt[1] + background_im_height - content_imgs[1]["height"],
            left: background_im_lt[0] + background_im_width - content_imgs[1]["width"]
        },
        {
            input: append_text_img_buf_lists[0],
            top: 760,
            left: 120
        },
        {
            input: append_text_img_buf_lists[1],
            top: 760,
            left: 720
        },
    ])

    return diary_img
}

async function make_text_img(text, font_size=30){
    const canvas_height = 312; 
    const canvas_width = 540;
    
    const canvas = createCanvas(canvas_width, canvas_height);
    const ctx = canvas.getContext('2d');
    ctx.font = `${font_size}px "GenEiChikugoMin2 Regular"`;

    // 縦書きに関する処理を行う

    chCountPerColLine = Math.floor(canvas_height / font_size); // 縦に何文字入るか
    chCountPerRowLine = Math.floor(canvas_width / font_size); // 横幅に何列入るか
  
    const reg = new RegExp('.{' + chCountPerColLine + '}', 'g');
  
    let textList;
    if(text.length <= chCountPerColLine){
      textList = [text];
    }
    else{
      textList = text.match(reg);
      textList = textList.slice(0, chCountPerRowLine)
    
      if(text.length % chCountPerColLine != 0)
        textList.push(text.substr( -1 * text.length % chCountPerColLine));
    }
  
    const startX = canvas_width - font_size;
    const startY = 0 + font_size;

    textList.forEach(function(elm, i) {
      Array.prototype.forEach.call(elm, function(ch, j) {
        ctx.fillText(ch, startX - font_size * i, startY + font_size * j);
      });
    });

    // 日付の画像の作成
    const date = new Date();

    const canvas_time = createCanvas(font_size, canvas_height);
    const ctx_time = canvas_time.getContext('2d');
    ctx_time.font = `${font_size}px "GenEiChikugoMin2 Regular"`;    
    
    const month = String(date.getMonth() + 1);
    ctx_time.fillText(month, 6, 26);

    const day = String(date.getDate());
    ctx_time.fillText(day, 6, 86);

    const dayOfWeek = [ "日", "月", "火", "水", "木", "金", "土" ][date.getDay()] ;
    ctx_time.fillText(dayOfWeek, 0, 175);


    return [canvas.toBuffer(), canvas_time.toBuffer()];
}

// const select_image = require('./select_image');
// (async () => {
//     let img_paths = await select_image("テスト");
//     let append_content_img_lists = await load_img(img_paths);
//     let append_text_img_buf_lists =  await make_text_img("私は犬を食べました");
//     let diary_img = await concat_img(append_content_img_lists, append_text_img_buf_lists);
    
//     // const diary_img_metadata = await diary_img.metadata();
//     // console.log(diary_img);

//     diary_img.toFile('/app/app/test.png');
// })();

module.exports = {
    load_img, concat_img, make_text_img
}