import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './CSS/root.css';
import Home from './Components/Home';
import GameSession from './Components/GameSession.js';
import Description from './Components/Description.js';
import CreateGame from './Components/CreateGame.js';
import HostRoom from './Components/HostRoom.js';
import JoinRoom from './Components/JoinRoom.js';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter className='top-level-container'>
      <Routes>
        <Route path="/" element={<Home/>}>
          <Route index element={<Description/>} />
          <Route path="create" element = {<CreateGame/>}/>
          <Route path="signup" element = {''}/>
          <Route path="login" element = {''}/>
          <Route path="play" element = {<GameSession/>}/>
          <Route path="g/:gameId" element = {<GameSession/>}/>
          <Route path="host/:gameId" element = {<HostRoom/>}/>
          <Route path="room/:roomCode" element = {<JoinRoom/>}/>
          <Route path="play/:gameboardId" element = {<GameSession/>}/>
          <Route path="play/:gameboardId/:param2" element = {<GameSession/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
