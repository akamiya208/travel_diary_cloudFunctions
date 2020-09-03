const axios = require('axios');
const qs = require('qs');

async function nlp_processing(text){
    const data = qs.stringify({
        'sentence': text,
        'appid': process.env['YAHOO_APP_ID'],
        'output': 'json' 
      });

    return axios({
            method: 'post',
            url: 'https://jlp.yahooapis.jp/KeyphraseService/V1/extract',
            data : data
        })
        .then(function (response) {
            let query = "";
            let score = -1;

            Object.keys(response.data).map(keyphrase => {
                if(response.data[keyphrase] > score){
                    score = response.data[keyphrase];
                    query = keyphrase;
                }
            });

            return query;
        })
        .catch(function (error) {
            console.log(error);
        });
}

async function select_image(text){
    // 自然言語処理に基づいた処理を行う。
    let query = await nlp_processing(text);
    let key = process.env['PIXABAY_API_KEY'];

    let params = {
        key : key,
        lang: "ja",
        q: query,
        image_type: "photo",
        orientation: "horizontal",
    };

    let url_list = await axios.get('https://pixabay.com/api/',{
          params: params,
    })
    .then(function (response) {
        let pixabay_url_list = [];
        if(response.data.hits.length > 1){

            for (let i = 0; i < 2; i++) {
                let arrayIndex = Math.floor(Math.random() * response.data.hits.length);
                pixabay_url_list.push(response.data.hits[arrayIndex]["webformatURL"]);
                pixabay_url_list.splice(arrayIndex, 1);
            }
            
            return pixabay_url_list
        }else{
            params.q = "";
            params.category = "travel";

            return axios.get('https://pixabay.com/api/',{
                    params: params,
                }).then(function(response){
                    for (let i = 0; i < 2; i++) {
                        let arrayIndex = Math.floor(Math.random() * response.data.hits.length);
                        pixabay_url_list.push(response.data.hits[arrayIndex]["webformatURL"]);
                        pixabay_url_list.splice(arrayIndex, 1);
                    }
                    
                    return pixabay_url_list
                });
        }
    })
    .catch(function (err) {
        console.log(err);
    });

    url_list.push(process.env['ENV'] +'/diary_template/' + "diary_template.png");
    return url_list
}

module.exports = select_image;