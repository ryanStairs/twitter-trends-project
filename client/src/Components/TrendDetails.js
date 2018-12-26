import React from 'react';
// import  {Link} from 'react-router-dom';
import {BrowserRouter} from 'react-router-dom';


import {BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from 'recharts';

class TrendDetails extends React.Component{

    state = {
        popularTweets : [],
        news: [],
        trendsIndex: '',
        mounted: false,
      }
    
      
      async componentDidMount() {

        let que = {
            q: this.props.match.params.query
        }
        const init = {
            body: JSON.stringify(que),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }

        const popularResult = await fetch('http://localhost:8080/popular', init);
        const popular = await popularResult.json();
        const newsResult = await fetch('http://localhost:8080/news', init);
        const news = await newsResult.json()
        this.setState({popularTweets: popular, news: news, mounted: true,
                    trendsIndex: this.props.trends.findIndex(trend => trend.query === this.props.match.params.query)})
    }

    componentWillUnmount() {
        //
    }

    ver = () => {
        return (
            <img id='verified' src='/Assets/twitter-verified.svg' alt='Twitter Verified'/>
        )
    }

    noTweets = () => {
        return <div className='details-tweet' style={{textAlign: 'center'}}><h3>No Tweets Available</h3></div>
    }
      
    render(){
        
      if(this.state.mounted){

        let i = this.state.trendsIndex;
        // let emotions = this.props.emotions;
        let trends = this.props.trends[i];
        let news = [];
        if(this.state.news.articles[0]){
            news = this.state.news.articles[0];
        }else{
            // if no news article found on topic use this
            news = {
                title: 'No Story Available',
                source: {
                    name: ''
                },
                author: '',
                publishedAt: '',
                description: '',
                url: '', 
                urlToImage: '/Assets/not_available.png'
            }
        }

        let vf = '';
        let tweets = [];
        let displayTweets = [];

        if(this.state.popularTweets[0]){
            // if user is verified render verified image
            tweets = this.state.popularTweets;
            if(tweets[0].user.verified){
                vf = this.ver();
            }
            // maps through and creates visual representation on screen for each tweet
            displayTweets = tweets.map((twt,index) => {
                return (
                    <div key={index} className='details-tweet'>
                        <div className='tweet-user'>
                            <div className='tweet-user__left'>
                                <div className='tweet-user__left-left'>
                                    <img id='user-image' src={twt.user.profile_image_url_https} alt='Twitter user'/>
                                </div>
                                <div className='tweet-user__left-right'>
                                    <div className='semi-bold'>{twt.user.name}{ vf }</div>
                                    <span className='grey'>{twt.user.screen_name}</span>
                                </div>
                            </div>
                            <div className='tweet-user__right'>
                            <img src='../Assets/twitter.svg' alt='Twitter Logo'/>
                            </div>
                        </div>
                        <div className='tweet-text'>
                            <p>{twt.text}</p>
                        </div>
                        <div className='tweet-date grey'>
                            {(twt.created_at).slice(0,16)}
                        </div>
                        <div className='tweet-actions'>                      
                            <span id='retweet'>{twt.retweet_count}</span><span id='retweet-title'>Retweets</span>
                            <span id='like'>{twt.favorite_count}</span><span>Likes</span>
                        </div>
                    </div>
                )
            })
        // if no tweets on topic found render no available msg div
        }else{ displayTweets = this.noTweets(); }
        

        // if need to sort emotion tones again by highest score use this
        // let emotionTones = trends.tone.tone_categories[0].tones.sort((a, b) => {return b.score- a.score});

        let emotionTones = trends.tone.tone_categories[0].tones;

        emotionTones.forEach(item => {
            if(item.tone_name === 'Joy'){
                item.emoji = "😃"
            }else if(item.tone_name === 'Anger'){
                item.emoji = "😡"
            }else if(item.tone_name === 'Disgust'){
                item.emoji = "🤢"
            }else if(item.tone_name === 'Sadness'){
                item.emoji = "😢"
            }else if(item.tone_name === 'Fear'){
                item.emoji = "😱"
            }
        });
        
        let sent = '';
        let c = 'blue'
        if(trends.sentiment > 0){
            sent = '✅ Positive';
            c = 'green';
        }else if(trends.sentiment < 0){
            sent = '❌ Negative'
            c = 'red';
        }else{
            sent = '❔ Neutral'
        }

        const data = [
            {tone: emotionTones[0].emoji, Emotions: Math.round(emotionTones[0].score * 100)},
            {tone: emotionTones[1].emoji, Emotions: Math.round(emotionTones[1].score * 100)},
            {tone: emotionTones[2].emoji, Emotions: Math.round(emotionTones[2].score * 100)},
            {tone: emotionTones[3].emoji, Emotions: Math.round(emotionTones[3].score * 100)},
            {tone: emotionTones[4].emoji, Emotions: Math.round(emotionTones[4].score * 100)}
        ];
        // create chart for emotional tones on topic
        const simpleBarChart = () => {
            
            return (
                <ResponsiveContainer>
                    <BarChart data={data}
                        margin={{top: 5, right: 30, left: 20, bottom: 5}}>
                    <CartesianGrid strokeDasharray="3 3"/>
                    <XAxis dataKey="tone"/>
                    <YAxis/>
                    <Tooltip/>
                    <Legend />
                    {/* <Bar dataKey="Emotions" fill="#8884d8" /> */}

                    <Bar dataKey="Emotions" fill="#8884d8">
                        {
                            data.map((entry, index) => {
                                let color = '';
                                if(entry.tone === '😡'){
                                    color = 'red';
                                }else if(entry.tone === '🤢'){
                                    color = '#7a9460';
                                }else if(entry.tone === '😱'){
                                    color = '#f2e090';
                                }else if(entry.tone === '😃'){
                                    color = 'orange';
                                }else if(entry.tone === '😢'){
                                    color = '#667799';
                                }
                                return <Cell fill={color} />;
                            })
                        }
                    </Bar>

                    </BarChart>
                </ResponsiveContainer>
                );
        
        }

            return(
                <div className='trend-details-main'>
                    <div className='details-first'>
                        <h2>{trends.name}</h2>
                        <p className='space-between'>
                            <span className='volume'>  <span className='volume-title semi-bold'>Tweet Volume:</span>{trends.tweet_volume}  </span>
                            <span className='sentiment'>  <span className='volume-title semi-bold'>Overall Sentiment of Tweets:</span> <span className='sent-sizing semi-bold' style={{color: c}} >{ sent }</span> </span>
                        </p>
                        <span className='block semi-bold'>Emotional Tone Analysis: </span>
                        <p className='emotions-center'>
                            <span>Anger 😡</span><span>Disgust 🤢</span><span>Fear 😱</span><span>Joy 😃</span><span>Sadness 😢</span>
                        </p>
                        <div className='chart-container'>
                        { simpleBarChart() }
                        </div>
                    </div>
                    <div className='details-news'>
                        <h4>{news.title}</h4>
                        <span className='news-subtitle royalblue'>
                            <span className='medium margin-right'>{news.source.name}</span>
                            <span className='margin-right'>{news.author}</span>
                            <span className='margin-right'>{(news.publishedAt).slice(0, 10)}</span>
                        </span>
                        <p>{news.description}</p>
                        <a href={news.url} target="_blank" rel="noopener noreferrer">
                            <img src={news.urlToImage} alt='News story'/>
                        </a>
                    </div>
                    { displayTweets }
                </div>
            )
        }else{
            return (
                <div className='loading-container'>
                <h3>Loading...</h3>
                <div className='loading'></div>
                </div>
            )
        }
    }
}

export default TrendDetails;