"use strict";
// ipfs daemon --enable-pubsub-experiment --enable-namesys-pubsub


import '../css/App.css';
import '../css/mui.css';

import Button from '@mui/material/Button';

import React from 'react';
import {Link } from 'react-router-dom';

// const peers = await pRetry(async () => {



 function homePage() {

    
  return (
    <div  className='sans-serif'>
      <main style={{textAlign: "center",backgroundColor:'#808080'}}>

            <section className='bg-snow mw7 center mt5 ' style={{ textAlign: "center"}}>
            <h1 className='f3 fw4 ma0 pv3 aqua montserrat tc' style={{color: "#97CE4C",backgroundColor:'black'}} data-test='title'>Audio Data Scrambler</h1>
            <div  className='pa4' >
             <UIOptions  keys={['Scramble']}  />
             <UIOptions  keys={['Coordinate']}  />
            </div>
          </section>
        

      </main>

    </div>
  );
}


const UIOptions = ({keys}) => {

    return (   
        
      <div >
          
  {keys?.map((key) => (


<div   className='mb4'  key={key}>

<Link to={"/"+key}>
<Button value={key} variant="contained"
    style={{justifyContent: "flex-start",color: "#97CE4C",backgroundColor:'black'}} >
        {key}</Button>
</Link>

  
  {/* <div className='bg-white pa2 br2 truncate monospace' data-test={key}>{obj[key]}</div> */}
</div>

))}


      

      </div>
         

    )
  }


export default homePage;
