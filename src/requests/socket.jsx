import SockJS from 'sockjs-client';
import {Stomp} from '@stomp/stompjs';

const connectToSockJs = (path, userId) => {
  
  const stompClient = Stomp.over(function(){
    return new SockJS(`http://localhost:8080/ws/${path}`)
  });

  return new Promise((resolve, reject) => {
    stompClient.connect({UserId: userId}, (frame) => {
      console.log('Connected: ' + frame);
      resolve(stompClient);
    }, (error) => {
      console.error('Connection error: ' + error);
      reject(error);
    });
  });
};

export default connectToSockJs