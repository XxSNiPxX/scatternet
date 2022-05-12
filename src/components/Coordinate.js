"use strict";
// ipfs daemon --enable-pubsub-experiment --enable-namesys-pubsub

import { useState, useEffect } from 'react';
import useIpfsFactory from '../hooks/use-ipfs-factory'
import useIpfsRPCFactory from '../hooks/use-ipfs-rpc-factory'
// import useIpfs from '../hooks/use-ipfs.js'

import * as json from 'multiformats/codecs/json'

import '../css/App.css';
import '../css/mui.css';
import { Buffer } from "buffer";

// import { experimentalStyled as styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/system';
import ScopedCssBaseline from '@mui/material/ScopedCssBaseline';
import Button from '@mui/material/Button';
import {Link } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import { concat } from 'uint8arrays/concat'

const all = require('it-all')

var _ = require('lodash');
const last = require('it-last')

const Logger=outEl => {
  outEl.innerHTML = ''
  return message => {
    const container = document.createElement('div')
    container.innerHTML = message
    outEl.appendChild(container)
    outEl.scrollTop = outEl.scrollHeight
  }
}

//Globally stored address data set
//This needs to be changed to user input and 
//must have the ability to connect to various other nodes to disperse the 
//data packet


// const peers = await pRetry(async () => {
  function buf2hex(buffer) { // buffer is an ArrayBuffer
    return [...new Uint8Array(buffer)]
        .map(x => x.toString(16).padStart(2, '0'))
        .join('');
  }

  const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: 'aliceblue',
    padding: theme.spacing(2),
    textAlign: 'center',
    color: 'darkslategray',
  }));
  function toBuffer(ab) {
    const buf = Buffer.alloc(ab.byteLength);
    const view = new Uint8Array(ab);
    for (let i = 0; i < buf.length; ++i) {
        buf[i] = view[i];
    }
    return buf;
}

 function Coordinate() {
  const { ipfs, ipfsInitError } = useIpfsFactory({ commands: ['id'] })
  const { ipfsRPC, ipfsRPCInitError } = useIpfsRPCFactory({ commands: ['id'] })
  const [shouldDisableDownload,triggerDownload]=useState(true)
  const [scatterData,updateScatterData]=useState(null)
  const [version, setVersion] = useState(null)
  let log=null;
  if(document.getElementById("console") !== null){
    //code
    log = Logger(document.getElementById("console"));
    
   } 
  
  
// Random number generator between a range used to determine coordinate locations
  function getRndInteger(min=0, max=10000) {
    return Math.floor(Math.random() * (max - min)) + min;
  }
  //What should i have on file input?
  //On file input create 5 distinct coordinates as an array.Return those coordinates
  //Create the respecive key names and generate keys for those coordinates

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

      customBreak:{
        console.log(event.target.files[0]);
        console.log(event.target.result);
    
        log("Processing uploaded configuration.")
    
        const buffer = await event.target.files[0].arrayBuffer();
        let jsonData=await JSON.parse(new TextDecoder().decode(buffer))
        console.log(jsonData)
        //Basic error checking
        let shouldBreak=false;
        if(jsonData.hasOwnProperty('coordinates')&&jsonData.hasOwnProperty('type')){
            console.log('here')
        }else{
            log(`<span class="red">[Fail] Wrong Json format!</span>`);
            shouldBreak=true
        }

        if(shouldBreak==true){
            break customBreak
        }
        //get ket data
       
        let wholeData=[]
        var keys=await ipfsRPC.key.list()
        console.log(keys)
          for(let i=0;i<jsonData.coordinates.length;i++){
            console.log(jsonData.coordinates[0])
            console.log('This is the ['+i+"  one ].     Terrible lingustics i say!")
              const bytes_ = json.encode(jsonData.coordinates[i])
              let keyName=buf2hex(bytes_)
              
              let keyID=null;
              //oops this is an asymtotically large computation
              
              keys.forEach((e,index)=>{
                if(e.name==keyName){
                  console.log(index)
                    keyID=e;
                    return
                }
              })
              console.log(keyID)

              let ipns_addr='/ipns/'+keyID.id
              let addr= await last(ipfsRPC.name.resolve(ipns_addr))
              let data=await all(ipfsRPC.cat(addr))
                console.log(concat(data))
                wholeData.push(concat(data))
              
              
           
          }
          console.log(concat(wholeData),wholeData.length,concat(wholeData).length)
     let full_data=concat(wholeData)


//           var abuf7 = createBuffer(wholeData[0], 'interleaved 96000')
// console.log(abuf7)
    
    var blob = new window.Blob([new Uint8Array(full_data, full_data.length, full_data.length)], {
      type: 'audio/wav'
    })

    var url = window.URL.createObjectURL(blob)
    const link = document.createElement('a');
    link.href = url;
    link.download =   "coordinate.wav";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);



    //     let byteArray = new Int8Array(buffer);
    //     const bufferData=toBuffer(byteArray);
    //     console.log(bufferData)
    //     let size=parseInt(byteArray.length/1)
    //     let temm= await  _.chunk(byteArray,size)
    //     let indicesNumber=Math.ceil(event.target.files[0].size/size)
    //     let keyData=await IndiceGenerator(indicesNumber,temm)
    //     log(`Starting to push data to the respective indices...`)
    //     let scatterConfig={
    //       coordinates:[],
    //       type:''
    //     };
    //     log(`Total indices to push --- ${keyData.length}`)
    //     for(let i=0;i<keyData.length;i++){
    //       log(`Pushing ${i+1} of ${keyData.length}`)
    //       const pushData = await ipfsRPC.add(keyData[i]["data"])
    //       console.log(pushData,i,'is')
    //       let path='/ipfs/'+pushData.path
    //       try{
          
    //       const results = await ipfsRPC.name.publish(path, {
    //         resolve: false,
    //         key: keyData[i].key.id,
    //       });
    //       log(`Published ${results.name} to ${results.value}`); //
          
    //     }
    //     catch(error){
    //         log(error)
    //     }
    //   }
    //   keyData.forEach(e=>{
    //     scatterConfig.coordinates.push(e['location'])
    //   })
    //   scatterConfig.type=event.target.files[0].type
    //   console.log(scatterConfig)
    //   updateScatterData(scatterConfig)
    //   triggerDownload(false)
    //   log(`Done.`); //
    //   log('Download the configuration file.')
    

  }


	};

  useEffect(() => {

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
  
       await ipfs.swarm.connect(`/ip4/127.0.0.1/tcp/4003/ws/p2p/${"12D3KooWDTBbTcTL3YWmn9paiYyirxsmkEbtCiJLW5yJQ3Naoqii"}`)
       log(`Connected to go-ipfs.`);
       log(`Getting peers and key list...`);
       const peers=await ipfs.swarm.peers()
       var keyy=await ipfsRPC.key.list()
       log(`Got peers and key list.`);
       log("Please select a file to scatter.")
          // let fullData=[]
          // for(let i=0;i<keyy.length;i++){
          //   console.log('This is the '+i+" one")
          //   if(keyy[i].name!=='self'){
              
          //     let ipns_addr='/ipns/'+keyy[i].id
      
          //     let addr= await last(ipfsRPC.name.resolve(ipns_addr))
          //     let data=await last(ipfsRPC.cat(addr))
          //     console.log(data)
          //     fullData.push(data)

          //   }
          // }

    }
    


    getVersion();
    connectSwarm();
  }, [ipfs,ipfsRPC])

  return (
    <div className='sans-serif'>

      <main style={{backgroundColor:'#808080'}}>
      <ScopedCssBaseline>
      <Box  style={{backgroundColor:'#808080'}} sx={{ flexGrow: 1 }}>

       {/* This is the grid that gets the Upload button with the note */}       

      <Grid container spacing={{ xs: 1, md: 2 }} columns={{ xs: 6 }}>

          <Grid item xs={15} sm={15} md={15}>
              <Alert severity="info">Info— Run your go-ipfs ,add your genesis  and configuration files,  with the necessary parameters within the project structure.</Alert>
          </Grid>
      <Grid  style={{textAlign: "center"}} item xs={2} sm={4} md={4} >

           <Grid container  spacing={{ xs: 6}} >
                <Grid item xs={15} sm={15} md={15}>
                <div >
                <label htmlFor="contained-button-file">
                  <Input onChange={changeHandler} accept="application/json" id="contained-button-file"  type="file" />
                  <Button style={{justifyContent: "flex-start",color: "#97CE4C",backgroundColor:'black'}} variant="contained" component="span">
                    Upload
                  </Button>
                </label>
                      </div>
                </Grid>
                <br/><br/>

              <Grid item xs={15} sm={15} md={15}>
               <div >
                  <Paper style={{ padding: "40px 20px" ,backgroundColor:'#F0F8FF'}}>
                  <Grid container wrap="nowrap" spacing={2}>

                      <Grid justifyContent="left" item xs zeroMinWidth>
                      <p style={{ textAlign: "left", color: "gray" }}>
                          Note
                        </p>
                        <p style={{ textAlign: "left" }}>
                          Upload a coordinate Space definition .{" "}
                        </p>
                      
                      </Grid>
                </Grid>
                </Paper >
              </div>
              </Grid>

      
      </Grid>
            
            
   {/* This is the grid that gets the console up for user information */}       
      </Grid>
          <Grid style={{justifyContent: "flex-start",color: "#97CE4C",backgroundColor:'black'}} item xs={4} >
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
        style={{height: "300px",justifyContent:'center'}}
      ></div>
      
    </div>
    </Grid>

       {/* This is the grid that gets the Download button with the note */}       


      </Grid>
     <br></br>
      <Grid style={{textAlign: "center",backgroundColor:'#808080'}} item xs={15} sm={15} md={15}>
            <Link to={"/"}>
      <Button  variant="contained" component="span"
          style={{justifyContent: "flex-start",color: "#97CE4C",backgroundColor:'black'}}  >
              Back</Button>
      </Link>
          </Grid>
    </Box>
   </ScopedCssBaseline>

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




export default Coordinate;
