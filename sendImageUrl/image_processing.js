// see https://blog.capilano-fw.com/?p=5744
// see https://sharp.pixelplumbing.com/
const { registerFont, createCanvas} = require('canvas');
const sharp = require('sharp');
const axios = require('axios');

registerFont('./GenEiNuGothic-EB.ttf', { family: 'GenEiNuGothic Bold' })

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

    promises.push(sharp(background_img_path));    

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
    background_im_lt = [32, 60]
    background_im_lb = [32, 530]
    background_im_rb = [762, 530]
    background_im_rt = [762, 60]
    background_im_height = background_im_lb[1] - background_im_lt[1]
    background_im_width = background_im_rt[0] - background_im_lt[0]

    diary_img = await append_content_img_lists.pop();

    content_imgs = await resize_img_by_width(append_content_img_lists, background_im_width * 0.5);

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
            top: 590,
            left: 32
        },
        {
            input: append_text_img_buf_lists[1],
            top: 630,
            left: 701
        },
    ])

    return diary_img
}

async function make_text_img(text, font_size=30, line_spacing=3){
    const canvas_height = 380; 
    const canvas_width = 650;
    
    const canvas = createCanvas(canvas_width, canvas_height);
    const ctx = canvas.getContext('2d');
    ctx.fillRect(32, 600, canvas_width, canvas_height);
    ctx.font = `${font_size}px "GenEiNuGothic Bold"`;
    ctx.fillStyle = "rgb(255, 255, 255)";
    
    chCountPerColLine = Math.floor(canvas_height / font_size); // 縦に何文字入るか
    chCountPerRowLine = Math.floor(canvas_width / (font_size + line_spacing)); // 横幅に何列入るか
  
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
        ctx.fillText(ch, startX - (font_size + line_spacing ) * i, startY + font_size * j);
      });
    });

    // 日付の画像の作成
    const date = new Date();

    const canvas_time_width = font_size;
    const canvas_time_height = 350;
    
    const canvas_time = createCanvas(canvas_time_width, canvas_time_height);
    const ctx_time = canvas_time.getContext('2d');
    ctx_time.font = `${font_size}px "GenEiNuGothic Bold"`;
    ctx_time.fillStyle = "rgb(255, 255, 255)";
    
    const month = String(date.getMonth() + 1);
    ctx_time.fillText(month, 5, 50);

    const day = String(date.getDate());
    ctx_time.fillText(day, 5, 140);

    const dayOfWeek = [ "日", "月", "火", "水", "木", "金", "土" ][date.getDay()] ;
    ctx_time.fillText(dayOfWeek, 0, 232);


    return [canvas.toBuffer(), canvas_time.toBuffer()];
}

module.exports = {
    load_img, concat_img, make_text_img
}