"use strict";
// ipfs daemon --enable-pubsub-experiment --enable-namesys-pubsub

import './css/App.css';
import './css/mui.css';

// import { experimentalStyled as styled } from '@mui/material/styles';
import Coordinate from './components/Coordinate'
import Scramble from './components/Scramble'
import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import homePage from './components/homePage'
// const peers = await pRetry(async () => {


 function App() {
   

    
  return (
    <div style={{backgroundColor:'#808080'}} className='sans-serif'>
      <header className='flex items-center pa3 bg-black bb bw3 b--black' style={{color: "#97CE4C",position:'sticky'}}>
        {/* <a href='https://ipfs.io'  title='home'>
          <img alt='IPFS logo'  style={{ height: 50 }} className='v-top' />
        </a> */}
        <h1 className='flex-auto ma0 tr f3 fw2 montserrat aqua' style={{color: "#97CE4C"}}>Scatternet v1</h1>
      </header>
      <main style={{height:'100vh'}}>

      <Router>
    <Switch>
    <Route path="/Scramble" exact component={Scramble} />
      <Route path="/" exact component={homePage} />
      <Route path="/Coordinate" exact component={Coordinate} />
    </Switch>
  </Router>

      </main>
      <footer style={{backgroundColor:'#808080'}} className="react-header">
        
      </footer>


    </div>
  );
}




export default App;
