import React from 'react';
import  {Link} from 'react-router-dom';

class Header extends React.Component {
    render(){
        return(
            <header>
                <Link to='/trends'><h1>Trending Now</h1></Link>
                <div className='header-location'><span className='header-location'>Location:<span className='bold-text'>Toronto</span></span><img src='../Assets/cn-tower.svg' alt='CN Tower icon'/></div>
            </header>
        )
    }
}

export default Header;
