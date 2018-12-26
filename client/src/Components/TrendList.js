import React from 'react';
import Trend from './Trend';
import Footer from './Footer';

class TrendList extends React.Component{

    componentDidMount = () => {
        // this.props.getTrends();
        // console.log('trend list mounted')
    }

    render(){
        let trendList = this.props.trends
        .map((trend) => {
        return (
            <Trend
            key = {trend.query}
            name = {trend.name}
            volume = {trend.tweet_volume}
            query = {trend.query}
            sentiment = {trend.sentiment}
            tone = {trend.tone.tone_categories[0].tones}
            emotions = {this.props.emotions}
            />
        )
        })
        return (
            <div>
                <div className='trends-main'>
                { trendList }
                </div>
                <Footer />
            </div>
        );
    }   
}

export default TrendList;