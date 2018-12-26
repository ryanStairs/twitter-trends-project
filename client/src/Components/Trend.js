import React from 'react';
import  {Link} from 'react-router-dom';


class Trend extends React.Component{
render(){

    // code for use with Microsoft sentiment analysis
    // let c = 'red';
    // if(Math.round((this.props.sentiment)*100)>=50){
    //     c = 'green'
    // }

    // let c = '';
    // if(this.props.sentiment > 0 ){
    //     c = 'green'
    // }else if(this.props.sentiment < 0){
    //     c = 'red'
    // }else{
    //     c = 'blue'
    // }

    let sent = ''
    if(this.props.sentiment > 0 ){
        sent = '👍🏽'
    }else if(this.props.sentiment < 0){
        sent = '👎'
    }else{
        sent = '❔'
    }

    let emoji = '';

    let toneScores = [];
    this.props.tone.forEach(t => {
        toneScores.push(t.score)
    });

    let highScore = 0;
    let highScoreIndex = 0;
    // figure out which emotional tone has the highest score 
    for(let i=0; i<toneScores.length; i++){
        if(highScore < toneScores[i]){
            highScore = toneScores[i];
            highScoreIndex = i;
        }
    }
    // use emoji corresponding with which emotion has highest score
    switch(highScoreIndex) {
        case 0:
            emoji = this.props.emotions[0]
            break;
        case 1:
            emoji = this.props.emotions[1]
            break;
        case 2:
            emoji = this.props.emotions[2]
            break;
        case 3:
            emoji = this.props.emotions[3]
            break;
        case 4:
            emoji = this.props.emotions[4]
            break;
        default:
            emoji = '';
      }

    return(
        <Link to={'/details/' + escape(this.props.query)}>
            <div className='trend-container'>
                <div className='trend-name'>{this.props.name}</div><div className='trend-volume'>{this.props.volume}</div>
                <div className='trend-sentiment'>{sent}</div>
                {/* code for microsoft analysis */}
                {/* style={{color: c}} */}
                {/* {Math.round((this.props.sentiment)*100)+'%'} */}
                <div className='trend-emotion'>{emoji}</div>
                {/* <span className='emoji'></span> */}
            </div>
        </Link>
    )
}

}

export default Trend;