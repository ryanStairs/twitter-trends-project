const fetch = require('node-fetch');
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const dotenv = require('dotenv');
dotenv.config();
const app = express()
const toneData = require('./toneTestData.json');
const tweetTextData = require('./tweetTestText.json');
const sentData = require('./sentTestData.json');

const SentimentNPM = require('sentiment');
let sentimentNPM = new SentimentNPM();

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

let port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log('Your server is running on PORT: ' + port);
});

const ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');

let toneAnalyzer = new ToneAnalyzerV3({
    iam_apikey: process.env.IBM_TONE_API_KEY,
    version: '2016-05-19',
    url: 'https://gateway.watsonplatform.net/tone-analyzer/api/'
});

let Twitter = require('twitter');

let client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    // for application based auth - higher search rate limit (use bearer token)
    bearer_token: process.env.TWITTER_BEARER_TOKEN
    // these are used for user based auth (allows posting of tweets etc, but rate limit on search is 150/15min rather than 450/15min)
    // access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    // access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
  });

const popTweetCount = 4;
// sends most popular tweets (number of specified in popTweetCount) for query parameter it receives in POST request's body
app.post('/popular', (req, res) => {
    client.get('search/tweets', {q: req.body.q, result_type: 'popular', count: popTweetCount, lang: 'en'},) 
        .then(tweets => {
            let popTweets = [];
            tweets.statuses.forEach(element => {
                popTweets.push(element);
            })
            // if no popular Tweets are found then get recent ones
            if(!Array.isArray(popTweets) || !popTweets.length) {
                client.get('search/tweets', {q: req.body.q, result_type: 'recent', count: popTweetCount, lang: 'en'},) 
                    .then(tweets => {
                        tweets.statuses.forEach(element => {
                            popTweets.push(element);
                        })
                        res.json(popTweets)
                    })
                    .catch(err => {
                        res.json({msg: err})
                    })
            }else{
                res.json(popTweets);
            }            
        })
        .catch(err => {
            res.json({msg: err})
        })

})

// adjust to get more news stories
const newsCount = 1;

// use this date for news from date
let d = new Date(),
    month = '' + (d.getMonth()+1),
    day = '' + (d.getDate()),
    // getDate()-1 for a day ago, -2 for two etc
    year = d.getFullYear();

if (month.length < 2) month = '0' + month;
if (day.length < 2) day = '0' + day;

nd = [year, month, day].join('-');

app.post('/news', (req,res) => {

    fetch('https://newsapi.org/v2/everything?q=' + req.body.q + '&apiKey='+process.env.NEWS_API_KEY+'&language=en&from='+ nd +'&sortBy=popularityt&pageSize='+newsCount)
    .then(news => {
        return news.json();
    })
    .then(n => {
        if(!Array.isArray(n.articles) || !n.articles.length) {
            console.log('No English articles found - searching all languages')
            fetch('https://newsapi.org/v2/everything?q=' + req.body.q + '&apiKey='+process.env.NEWS_API_KEY+'&from='+ nd +'&sortBy=popularityt&pageSize='+newsCount)
            .then(news => {
                return news.json();
            })
            .then(n => {
                res.json(n);
            })
        }else{
            res.json(n);
        }
    })
    .catch(err => {
        res.json({msg: err})
    })

})


// sends top ten trending topics on twitter with sentiment and tone analysis of the trending topic's tweets 
app.get('/trends', (req, res) => {
    // option to exclude hashtags can be added to get request
    //, exclude: 'hashtags'
    // get trends from Twitter API by WOEID (where on earth ID - yahoo) 4118 is Toronto
    client.get('trends/place.json', {id: '4118'}) 
    .then(tweets => {
        // this holds top ten trends
        topTrends = getTopTrends(tweets);
        // go through top 10 trends and use Twitter API search endpoint to get Tweets for each trend by passing the trends query property  
        let mappedTweets = topTrends.map(element => {
        return searchTweetsText(element.query);
        })
        Promise.all(mappedTweets)
        .then(tt => {
            // now have text from trending topic tweets

            // using test data here to not overuse IBM API and get charged
            // let allTones = toneData;

            // for each trend this packages up all tweet text into a string and use getTone to send each to tone analyzer API 
            //    then push results into allTones array
            let allTones = [];
            for(let i=0; i < tt.length; i++){
                textToTone = '';
                tt[i].forEach(element => {  
                    textToTone += element;
                });
                allTones.push(getTone(textToTone));
            } 

            // using test data here to not overuse Microsoft API and get charged
            // let allSentiment = sentData;

            // sends tweet text through NPM AFINN based sentiment analysis and pushs results into array (rather then use microsoft api)
            let allSents = [];
            for(let i=0; i < tt.length; i++){
                textToSent = '';
                tt[i].forEach(twat => {
                    textToSent += twat;
                });
                allSents.push(runNPMSentiment(textToSent));
            }
            // add sentiment results to topTrends 
            topTrends.forEach((trend,index) => {
                trend.sentiment = allSents[index].comparative
            })


            // sends tweet text (tt) to sentiment Microsoft analysis API and store results 
            // let allSentiment = getSentiment(tt);

            // allTones is an array of promises allSentiment is a single promise 
            Promise.all([
                Promise.all(allTones)
                // If using Microsoft ,
                // allSentiment
            ])
            .then(results => {
                // now have results from tone and sentiment analysis apis (waits for these both to finish) 

                // adds analyzed tones to topTrends which will be sent to front end 
                let tones = results[0];
                for(let i=0; i<topTrends.length; i++){
                    topTrends[i].tone = tones[i].document_tone;
                }

                // let sentiment = results[1];
                // adds Microsoft Sentiment analyses and sends to front end 
                // res.json(addSentiment(tweetCount, sentiment, topTrends));
                res.json(topTrends);
            })
            .catch(err => {
                console.error(err);
            })
        })
        .catch(err => {
            console.error(err)
        });
    })
    .catch(err => {
        console.error(err);
    });
})

// uses NPM package AFINN based sentiment analysis (won't charge me like microsft)
let runNPMSentiment = (text) => {
    let result = sentimentNPM.analyze(text);
    return result;
}

const tweetCount = 100;
// gets from twitter API the tweets for the query param it is passed and for the number of tweets specified in tweetCount (max 100 each)
// gets 'mixed' results as popular would only return 15 and mixed is a combination of most popular and recent tweets
// then loops through tweet objects and just returns the actual text from the tweets
searchTweetsText = (q) => {
    return client.get('search/tweets', {q: q, result_type: 'mixed', count: tweetCount, lang: 'en'},) 
        .then(tweets => {
            let tweetText = [];
            tweets.statuses.forEach(element => {
                tweetText.push(element.text);
            })

            return tweetText;
        })
}

// sorts the twitter trends in descending order by tweet volume and then returns the top 10 trends
getTopTrends = (tweets) => {
    let trends = tweets[0].trends.sort((a, b) => {return b.tweet_volume - a.tweet_volume});

    let topTrends = [];
    
    for(let i=0; i<10; i++){
    topTrends.push(trends[i])
    }

    return topTrends;
}

// takes text and sends it to IBM Watson tone analyzer API that returns analysis of the text's tone including emotions expressed in the text 
getTone = (text) => {
    return new Promise( (resolve, reject) => {
        toneAnalyzer.tone({
            tone_input: text,
            content_type: 'text/plain',
            sentences: false
        }, (err, tone) => {
            if(err) return reject(err);
            return resolve(tone);
        });
    });
}

// takes the results from Microsoft sentiment analysis, adds up results for each trend, averages them and adds them to data for each trend 
// all text for all tweets is sent to API in a list so the function takes the tweet count to know how many tweets each trend has 
addSentiment = (tweetCount, sentiment, topTrends) => {
    let sentArr = [];
    let sentNum = 0;
    for (let i = 0; i < sentiment.documents.length; i++) {
        sentNum += sentiment.documents[i].score;
        if ((i+1)%tweetCount === 0) {
            sentArr.push(sentNum / tweetCount);
            sentNum = 0;
        }
    }

    for (let i = 0; i < topTrends.length; i++) {
        topTrends[i].sentiment = sentArr[i];
    }

    return topTrends;
}


// sends formatted tweet text to Microsoft API to analyze for sentiment (0 -> 1 with 0 being most negative and 1 most positive)
getSentiment = (docs) => {

    formattedDocs = formatSentText(docs);

    return new Promise( (resolve, reject) => {
        const init = {
            body: JSON.stringify(formattedDocs),
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'Ocp-Apim-Subscription-Key': process.env.MICROSOFT_SUBSCRIPTION_KEY
            }
        }

        fetch('https://canadacentral.api.cognitive.microsoft.com/text/analytics/v2.0/sentiment', init)
        .then((response) => {
            return response.json();
        })
        .then((sentiments) => {
            resolve(sentiments);
        })
        .catch((err) => {
            reject('Caught error: ', err);
        })
        
    });
}

// formats array of tweet text in the format that the Microsoft Sentiment analysis API requires
formatSentText = (arr) => {

    textToSent = [];

    arr.forEach(txt => {
        txt.forEach(txt => {
            textToSent.push(txt);
        })
    })


    const newTextToSent = {
        "documents": textToSent.map((txt,index) => {
            return(
                {
                    'id': String(index + 1),
                    'text': txt
                }
            )
        })
    }
    return newTextToSent;
}