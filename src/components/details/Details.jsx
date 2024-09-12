import React from 'react'
import './details.css';
import { auth } from '../../lib/firebase';
import { useChatStore } from '../../lib/chatStore';
import { useUserStore } from '../../lib/userStore';

const Details = () => {

  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock, resetChat } = useChatStore();
  const { currentUser } = useUserStore();

  const handleBlock = () => {
    
  };

  return (
    <div className="details">
      <div className="user">
        <img src={user?.avatar || './avatar.png'} alt='' />
        <h2>{user?.username}</h2>
        <p>{}</p>
      </div>
      <div className="info">
        <div className="option">
          <div className="titile">
            <span>Chat Settings</span>
            <img alt='' src='./arrowUp.png' />
          </div>
        </div>
        <div className="option">
          <div className="titile">
            <span>Privacy & Help</span>
            <img alt='' src='./arrowUp.png' />
          </div>
        </div>
        <div className="option">
          <div className="titile">
            <span>Shared Files</span>
            <img alt='' src='./arrowUp.png' />
          </div>
        </div>
        <button onClick={handleBlock}>Block User</button>
        <button className='logout' onClick={()=>auth.signOut()}>Logout</button>
      </div>
    </div>
  )
}

export default Details
