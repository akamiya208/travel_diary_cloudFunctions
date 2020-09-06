# travel_diary_cloudFunctions
- HACKU2020 の成果物のコード
    - https://youtu.be/meBisgAGHmg?t=3150
- 絵日記を生成するLINE BOTを作成する用のコード
- 2つの Cloud Functions から構成される
    - sendImageUrl : 画像を合成し，GCSに保存後，GCSのURLを送信する．
    - dialogflowFulfillment : DialogFlow側のFulfillment

## Requirement
- Google Cloud Functions
    - Node v10
    - 関数が2つあるので，インスタンスを2つ立ててください．
- Google Cloud Strage
- DialogFlow
    - DialogFlow Fulfillmentを使用
- PIXABAY API
- YAHOOキーフレーズ抽出 API

## Architecture
![Architecture](./architecture.jpg "Architecture")

## Google Cloud Functions
- ソースコードを確認しつつ，環境変数を設定してください．

### 1. sendImageUrl
- インスタンスが最高の2GBでの動作を推奨します．
#### ENV
- ENV
- PROJECT_ID
- GOOGLE_CLOUD_PROJECT
- PIXABAY_API_KEY
- YAHOO_APP_ID
- YAHOO_KEYPHRASE_API_URL : https://jlp.yahooapis.jp/KeyphraseService/V1/extract
- PIXABAY_API_KEY
- PIXABAY_API_URL : https://pixabay.com/api/

### 2. dialogflowFulfillment
- インスタンスが最低の128MBで動作します．
#### ENV
- SEND_IMAGE_API_URL : sendImageUrlでデプロイしたurl
- SEND_IMAGE_INTENT

## 所感
- 本当は一つの関数で収まりそうな予感がする．
