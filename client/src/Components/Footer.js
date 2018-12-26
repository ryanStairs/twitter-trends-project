import React from 'react';

class Footer extends React.Component {
    render(){
        return(
            <footer id='footer'>
                <span>Powered By:</span><img id='tweety-bird' src='../Assets/twitter-square.svg' alt='twitter log'/><img src='../Assets/IBM_logo.svg' alt='ibm logo'/><img src='../Assets/microsoft_logo_multi.svg' alt='microsoft logo' />
            </footer>
        )
    }
}

export default Footer;
