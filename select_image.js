async function nlp_processing(text){
    return text
}

async function select_image(text){
    // TODO: とりあえず画像のPATHを2個返却する

    // 自然言語処理に基づいた処理を行う。
    await nlp_processing(text);

    return [
        process.env['ENV'] +'/landscape/' + "photo0000-0222.jpg",
        process.env['ENV'] +'/landscape/' + "photo0000-3449.jpg",
        process.env['ENV'] +'/diary_template/' + "diary_template.png"
    ]
}

module.exports = select_image;