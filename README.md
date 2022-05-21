![Alt text](/img/screenshot.png?raw=true "IPFS Audio Scrambler")


# IPFS Audio Scrambler

Scramble and Coordinate audio data across ipfs nodes via ipns addresses mapped with a coordinate space.


## Disclaimer
This is a low-fidelity prototype that only runs with a local go-ipfs node and uses pseudo-random generators to create coordinate-space rather than the intended mathematical functions to describe the sequence of points. Please read the `FAQ` below. 

## Original Motivation

Initialization of asymptotically large matrixes/co-ordinate space within which one could traverse, do vector algebra and more to define a custom set of points to assign their data to.This can only be recreated by the original  sequence generator .This could be called "database rasterization" . As a user story one would -

1) Initialize a cube of coordinate space and assign a `4 byte` random buffer data to each point.

2) A function would be used to traverse through this coordinate space and generate a sequence of points. The data (audio,application,media) is then split into 4 byte arrays and published to each of the  point.

3) Even if the data can be accessed by anyone they would require the previously used sequence generator to recreate the original order of the data.

#### Possible applications include -

1) Selling components of an NFT which one needs to collect inorder to make a whole . This means you can sell 50% of your NFT to one person and another 50% to someone else.

2)  PGP type communication methods by exchange math functions.

3) Could one use such a method to reduce storage size of overlapping data? 

#### If i store `Hello` where each letter is one coordinate space and a sequence of them creates `Hello` ,  a new word `Hello world!` may just reference an already defined sequence and store `world!`





## Logic

### Setup
Make sure your go-ipfs node is running. Edit the genesis file as described in `/genesis`  with your coresponding data. 

### command to start go-ipfs node
ipfs daemon --enable-pubsub-experiment --enable-namesys-pubsub
### Steps to run
1) `npm i`
2) `npm start`

### Scramble
1) Audio File Input Buffer is transformed into chunks of `uint8` byte arrays of size `n`.
2) `n` coordinate locations in the form `{x: ** , y: ** ,z: **}` are created, converted into byte arrays .The hex of the byte arrays are used to generate `ipfs keys`
3) A `uint8` byte array is pushed to your local go-ipfs node and its `cid` is published via `ipfs name publish` with the key from step 2.
4)A `.json` represnting  coordinate-space and type is returned for the user to download

### Coordinate
1) the `.json` from scramble is transformed into hex via its byte arrays of size represnting the names of `ipfs keys`.
2) All the `ipfs keys` from the local go node is fetched and mapped with the key names obtained in step 1.
3) `n` key ids are resolved and its respective data is collected into blobs which is then downloaded to the users file system.



## FAQ
1) `How different is this from splitting a file into various CID's and concating them?`

Answer- A `cid` explicitly references the data while the ipns described within this prototype references the data as a point in coordinate space. Hence one could generate their own topological structures as sequences of coordinates and map their data to this. 

2) ` Is this not implemented already by `xxx` protocol?`

Answer- Sure it could be , while i did this for fun could you share the protocol so that i spend my thinking time elsewhere?


## Looking forward

Will attempt to create a higher order prototype as a standalone application using Orbit DB, fleek or any other such service.

## Links
https://www.youtube.com/watch?v=LjJ0mZ3hhE4

