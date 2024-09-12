import React, { useEffect, useRef, useState } from 'react';
import './chat.css';
import EmojiPicker from 'emoji-picker-react';
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useChatStore } from '../../lib/chatStore';
import { useUserStore } from '../../lib/userStore';
import upload from '../../lib/upload';

const Chat = () => {
  const [chat, setChat] = useState();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [uploaded, setUploaded] = useState(false);
  const [img, setImg] = useState({
    file: null,
    url: ''
  });
  const endRef = useRef(null);
  const { chatId, user } = useChatStore();
  const { currentUser } = useUserStore();

  useEffect(() => {
    endRef.current?.scrollIntoView({behavior: 'smooth'});
    document.addEventListener('click', (e) => {
      if(e.target.id != 'emoji' && e.target.className != 'epr-emoji-img epr_-a3ewa5 epr_-tul3d0 epr_xfdx0l epr_-u8wwnq epr_dkrjwv __EmojiPicker__ epr_-dyxviy epr_-w2g3k2 epr_-8yncdp epr_szp4ut'){
        setOpen(false);
      }
    });
  }, [chat?.messages]);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, 'chats', chatId), (res) => {
      setChat(res.data());
    });

    return () => {
      unSub();
    };
  }, [chatId]);


  const handleEmoji = (e) => {
    setText(prev => prev + e.emoji);
  };

  const handleImg = e => {
    if(e.target.files[0]){
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0])
      });
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();

    if(img.file) setUploaded(true);

    if(text === '' && !img.file){ 
      setUploaded(false);
      return;
    }
    let imgUrl = null;

    try{
      if(img.file){
        imgUrl = await upload(img.file);
      }

      await updateDoc(doc(db, 'chats', chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
          ...(imgUrl && { img : imgUrl })
        })
      });

      const userIDs = [currentUser.id, user.id];

      userIDs.forEach(async (id) => {
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if(userChatsSnapshot.exists()){
          const userChatsData = userChatsSnapshot.data();
          const chatIndex = userChatsData.chats.findIndex(c => c.chatId === chatId);

          userChatsData.chats[chatIndex].lastMessage = text;
          userChatsData.chats[chatIndex].isSeen = 
            id === currentUser.id ? true : false;
          userChatsData.chats[chatIndex].updatedAt = Date.now();

          await updateDoc(userChatsRef, {
            chats: userChatsData.chats,
          });
        }
      });
    } catch(err) {
      console.log(err);
    }

    setImg({
      file: null,
      url: ""
    });

    setText("");
    setUploaded(false); 
  };

  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img src={user?.avatar || './avatar.png'} alt='' />
          <div className="texts">
            <span> {user?.username} </span>
            <p>Sapce Space Space</p>
          </div>
        </div>
        <div className="icons">
          <img alt="" src="./phone.png" />
          <img alt="" src="./video.png" />
          <img alt="" src="./info.png" />
        </div>
      </div>
      <div className="center">
        {chat?.messages?.map(message => (
          <div className={message.senderId === currentUser.id ? "message own" : "message"} key={message.createdAt}>
            <div className="texts">
              {message.img && <img src={message.img} alt='' />}
              {message.text !== '' && <p>
                {message.text}
              </p>}
              <span>{message.senderId === currentUser.id ? "Sent" : ""}</span>
            </div>
          </div>
        ))}
        {uploaded && <div className='upload'>Uploading...</div>}
        <div ref={endRef}></div>
      </div>
      <div className="bottom">
        <form onSubmit={handleSend}>
          <div className="icons">
            <label htmlFor='file'>
              <img src='./img.png' alt=''/>
            </label>
            <input id='file' type='file' style={{ display: "none" }} onChange={handleImg} />
            <img src='./camera.png' alt=''/>
            <img src='./mic.png' alt=''/>
          </div>
          <div className='typeBox'>
            {img.file && <img src={img.file} />}
            <input type='text' placeholder='Type a message...' 
            value={text}
            onChange={e => setText(e.target.value)} />
          </div>
          <div className="emoji">
            <img src='./emoji.png'
            id='emoji'
            onClick={() => setOpen(prev => !prev)} />
            <div className='picker'> 
              {open && <EmojiPicker onEmojiClick={handleEmoji} />}
            </div>
          </div>
          <button className='sendButton'>Send</button>
        </form>
      </div>
    </div>
  )
}

export default Chat
