# travel_diary_cloudFunctions
- HACKU2020 の成果物のコード
- 絵日記を生成するLINE BOTを作成する用のコード
- 2つの Cloud Functions から構成される
    - sendImageUrl : 画像を合成し，GCSに保存後，GCSのURLを送信する．
    - dialogflowFulfillment : DialogFlow側のFulfillment

## Cloud Functions
### sendImageUrl
#### ENV
- ENV
- PROJECT_ID
- GOOGLE_CLOUD_PROJECT
- PIXABAY_API_KEY
- YAHOO_APP_ID
- YAHOO_KEYPHRASE_API_URL : https://jlp.yahooapis.jp/KeyphraseService/V1/extract
- PIXABAY_API_KEY
- PIXABAY_API_URL : https://pixabay.com/api/

### dialogflowFulfillment
#### ENV
- SEND_IMAGE_API_URL
- SEND_IMAGE_INTENT

## 所感
- 本当は一つの関数で収まりそうな予感がする．