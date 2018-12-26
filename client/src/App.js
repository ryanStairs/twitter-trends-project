import React, { Component } from 'react';
import './App.css';
import Header from './Components/Header';
import TrendList from './Components/TrendList';
import TrendDetails from './Components/TrendDetails';
import {BrowserRouter as Router, Route, Switch, Redirect} from 'react-router-dom';

class App extends Component {

  state = {
    trends : [],
    mounted: false,
    emotions: [
      //Anger
      '😡',
      //Disgust
      "🤢",
      //Fear
      "😱",
      //Joy
      "😃",
      //Sadness
      "😢",
    ]
  }

  getTrends = () => {
    fetch('http://localhost:8080/trends')
    .then(resp => {
      return resp.json();
    })
    .then((trendsData) => {
      this.setState({trends: trendsData, mounted: true})
    })
    .catch((err) => {
      console.error(err);
    })
  }
  

  componentDidMount = () => {
    this.getTrends();
  } 



  render() {

    if(this.state.mounted){
      return (
        <Router>
          <div className="App">
            <Header />
            <Switch>
              <Route path={'/trends'} exact render={ (props) => { return <TrendList {...props} getTrends={ this.getTrends } emotions={ this.state.emotions } trends={ this.state.trends } /> } } />
              <Route path={'/details/:query'} exact render={ (props) => { return <TrendDetails {...props} getTrends={ this.getTrends } emotions={ this.state.emotions } trends={ this.state.trends } /> } } />
              <Route path={'/'} render={() => <Redirect to='/trends' />} />
            </Switch>
          </div>
        </Router>
      );
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

export default App;
