"use strict";

// ipfs daemon --enable-pubsub-experiment --enable-namesys-pubsub

import { useState, useEffect } from 'react';
import useIpfsFactory from '../hooks/use-ipfs-factory'
import useIpfsRPCFactory from '../hooks/use-ipfs-rpc-factory'
import * as json from 'multiformats/codecs/json'
import '../css/App.css';
import '../css/mui.css';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/system';
import ScopedCssBaseline from '@mui/material/ScopedCssBaseline';
import Button from '@mui/material/Button';
import {Link } from 'react-router-dom';
import Alert from '@mui/material/Alert';
var genesis = require('../genesis/genesis.json'); //with path
var _ = require('lodash');
const last = require('it-last')

//HELPER FUNCTIONS

//Logs data to console
//This needs to become persistent.Currently updates on state change.
const Logger=outEl => {
  outEl.innerHTML = ''
  return message => {
    const container = document.createElement('div')
    container.innerHTML = message
    outEl.appendChild(container)
    outEl.scrollTop = outEl.scrollHeight
  }
}

//Byte Buffer to Hex. Used to convert the coordinate locations into valid IPNS Key Names.
  function buf2hex(buffer) {
    return [...new Uint8Array(buffer)]
        .map(x => x.toString(16).padStart(2, '0'))
        .join('');
  }

  //Item component
  const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: 'aliceblue',
    padding: theme.spacing(2),
    textAlign: 'center',
    color: 'darkslategray',
  }));

// Random number generator between a range used to determine coordinate locations
function getRndInteger(min=0, max=10000) {
  return Math.floor(Math.random() * (max - min)) + min;
}

  




  //main
 function Scramble() {
  const [load,loader] = useState(true);
  const { ipfs, ipfsInitError } = useIpfsFactory({ commands: ['id'] })
  const { ipfsRPC, ipfsRPCInitError } = useIpfsRPCFactory({ commands: ['id'] })
  const [shouldDisableDownload,triggerDownload]=useState(true)
  const [scatterData,updateScatterData]=useState(null)
  const [version, setVersion] = useState(null)
  let log=null;
  if(document.getElementById("console") !== null){
    log = Logger(document.getElementById("console"));
    
   } 
  
  
   //Generates co-ordinate spaces defining a data location
  const IndiceGenerator=async (size,temm)=>{
    let coordinateData=[]
    for(let i=0;i<size;i++){
      let x_=getRndInteger()
      let y_=getRndInteger()
      let z_=getRndInteger()
      const bytes_ = json.encode({ x: x_,y:y_,z:z_ })
    let kkey=await ipfsRPC.key.gen(buf2hex(bytes_), {
      type: 'ed25519'
    })
      coordinateData.push({location:{
        x:x_,
        y:y_,
        z:z_
      },
      key:kkey,
      data:temm[i]
   })
    }
    
    // console.log(kkey)
    return coordinateData
  }


  const onDownload=async()=>{
    const fileName = "coordinateSpace";
    const json = JSON.stringify(scatterData);
    const blob = new Blob([json],{type:'application/json'});
    const href = await URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = fileName + ".json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  }
  const changeHandler = async (event) => {
    console.log(event.target.files[0]);
    log(`Processing uploaded file of ${event.target.files[0].size} bytes.`)
    const buffer = await event.target.files[0].arrayBuffer();
    let byteArray = new Int8Array(buffer);
    //genesis chunk is used here
    let size=parseInt(byteArray.length/genesis['chunks'])
    let temm= await  _.chunk(byteArray,size)
    let indicesNumber=Math.ceil(event.target.files[0].size/size)
    let keyData=await IndiceGenerator(indicesNumber,temm)
    log(`Starting to push data to the respective indices...`)
    let scatterConfig={
      coordinates:[],
      type:''
    };
    log(`Total indices to push --- ${keyData.length}`)
    for(let i=0;i<keyData.length;i++){
      log(`Pushing ${i+1} of ${keyData.length}`)
      const pushData = await ipfsRPC.add(keyData[i]["data"])
      console.log(pushData,i,'is')
      let path='/ipfs/'+pushData.path
      try{
      const results = await ipfsRPC.name.publish(path, {
        resolve: false,
        key: keyData[i].key.id,
      });
      log(`Published ${results.name} to ${results.value}`); //
      
    }
    catch(error){
        log(error)
    }
  }
  keyData.forEach(e=>{
    scatterConfig.coordinates.push(e['location'])
  })
  scatterConfig.type=event.target.files[0].type
  console.log(scatterConfig)
  updateScatterData(scatterConfig)
  triggerDownload(false)
  log(`Done.`); //
  log('Download the configuration file.')


	};

  useEffect(() => {

    const loader = async () => {
      //*This is the loader
      console.log(load,'load is')
      if(!load) return;
      if(log==null) return;
      console.log('herr')
      log("The console is starting up.Please wait.")
      


    }
    const getVersion = async () => {
      //*This is an interrupter
      if (!ipfs ) return;
      if(log==null) return;
      //** 
      const nodeId = await ipfs.version();
      setVersion(nodeId);
    }

    const connectSwarm=async ()=>{
      //*This is an interrupter
      if (!ipfsRPC ) return;
      if (!ipfs ) return;
      if (log==null) return;
      //** 
  
       await ipfs.swarm.connect(`/ip4/127.0.0.1/tcp/4003/ws/p2p/${genesis['go-node-id']}`)
       log(`Connected to go-ipfs.`);
       log(`Getting peers and key list...`);
       const peers=await ipfs.swarm.peers()
       var keyy=await ipfsRPC.key.list()
       log(`Got peers and key list.`);
       log("Please select a file to scatter.")
    }
    


    getVersion();
    connectSwarm();
    loader();
  }, [ipfs,ipfsRPC])

  return (
    <div className='sans-serif'>

      <main style={{backgroundColor:'#808080'}}>
     
      <Box style={{backgroundColor:'#808080'}} sx={{ flexGrow: 1 }}>
      <ScopedCssBaseline>
       {/* This is the grid that gets the Upload button with the note */}       

      <Grid style={{backgroundColor:'#808080'}} container spacing={{ xs: 2, md: 3 }} columns={{ xs: 5, sm: 8, md: 12 }}>

          <Grid item xs={15} sm={15} md={15}>
              <Alert severity="info">Info— Run your go-ipfs , add your genesis file with the necessary parameters within the genesis  folder of the  project structure.</Alert>
          </Grid>
      <Grid  style={{textAlign: "center"}} item xs={2} sm={4} md={4} >

           <Grid container  spacing={{ xs: 2,sm:4 }} >
                <Grid item xs={15} sm={15} md={15}>
                <div >
                <label htmlFor="contained-button-file">
                  <Input onChange={changeHandler} accept="audio/*" id="contained-button-file"  type="file" />
                  <Button style={{justifyContent: "flex-start",color: "#97CE4C",backgroundColor:'black'}} variant="contained" component="span">
                    Upload
                  </Button>
                </label>
                      </div>
                </Grid>
                <br/><br/>

              <Grid item xs={15} sm={15} md={15}>
               <div >
                  <Paper style={{ padding: "40px 20px",backgroundColor:'#F0F8FF' }}>
                  <Grid container wrap="nowrap" spacing={2}>

                      <Grid justifyContent="left" item xs zeroMinWidth>
                      <p style={{ textAlign: "left", color: "gray" }}>
                          Note
                        </p>
                        <p style={{ textAlign: "left" }}>
                          Upload an audio file that you want to scatter.It splits it into n parts,creates the respective IPNS addresses and returns a tuple of locations.{" "}
                        </p>
                      
                      </Grid>
                </Grid>
                </Paper >
              </div>
              </Grid>

      
      </Grid>
            
            
   {/* This is the grid that gets the console up for user information */}       
      </Grid>
          <Grid item xs={2} sm={4} md={4}>
      <div className="ph3 mb3">

      <div
        id="console"
        className="
          f7
          db
          w-100
          ph1
          pv2
          monospace
          input-reset
          ba
          b--black-20
          border-box
          overflow-scroll
        "
        style={{height: "300px",backgroundColor:'black',color: "#97CE4C"}}
      ></div>
      
    </div>
    </Grid>

       {/* This is the grid that gets the Download button with the note */}       

    <Grid  style={{textAlign: "center"}} item xs={2} sm={4} md={4} >

           <Grid container  spacing={{ xs: 2,sm:4 }} >
                <Grid item xs={15} sm={15} md={15}>
                <div >

                  {/* <Input onChange={changeHandler} accept="image/*" id="contained-button-file" multiple type="file" /> */}
                  <Button disabled={shouldDisableDownload} onClick={onDownload} style={{justifyContent: "flex-start",color: "#97CE4C",backgroundColor:'black'}} variant="contained" component="span">
                    Download
                  </Button>
                
                      </div>
                </Grid>
                <br/><br/>

              <Grid item xs={15} sm={15} md={15}>
               <div >
                  <Paper style={{ padding: "40px 20px",backgroundColor:'#F0F8FF' }}>
                  <Grid container wrap="nowrap" spacing={2}>

                      <Grid justifyContent="left" item xs zeroMinWidth>
                      <p style={{ textAlign: "left", color: "gray" }}>
                          Note
                        </p>
                        <p style={{ textAlign: "left" }}>
                          Download a Configuration that helps you coorinate the data sequence.It identifies coordinate locations where the data is placed.{" "}
                        </p>
                      
                      </Grid>
                </Grid>
                </Paper >
              </div>
              </Grid>

      
      </Grid>
            
            
          
      </Grid>

      </Grid>
     
      <Grid  style={{textAlign: "center",backgroundColor:'#808080'}} item xs={15} sm={15} md={15}>
      <Link to={"/"} onClick={() => window.location.href="/"}>
      <Button   variant="contained" component="span"
          style={{justifyContent: "flex-start",color: "#97CE4C",backgroundColor:'black'}} >
              Back</Button>
      </Link>
          </Grid>
          </ScopedCssBaseline>
    </Box>

      </main>

    </div>
  );
}

const Title = ({ children }) => {
  return (
    <h2 className='f5 ma0 pb2 aqua fw4 montserrat'>{children}</h2>
  )
}

const Input = styled('input')({
  display: 'none',
});




export default Scramble;
