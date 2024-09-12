import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import './login.css';
import { createUserWithEmailAndPassword,signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { arrayUnion, collection, doc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import upload from '../../lib/upload';

const Login = () => {

    const [avatar, setAvatar] = useState({
        file: null,
        url: ''
    });

    const [loading, setLoading] = useState(false);

    const handleClick = (e) => {
        if(e.target.files[0]){
            setAvatar({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0])
            });
        }
    };

    useEffect(() => {
        if(avatar.url){
            console.log(avatar.url);
        }
    }, [avatar.url]);


    const handleLogin = async (e)  => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.target);
        const { email, password } = Object.fromEntries(formData);

        try{
            await signInWithEmailAndPassword(auth, email, password);
        } catch(error){
            console.log(error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        const chatRef = collection(db, 'chats');
        const formData = new FormData(e.target);
        const { username, email, password } = Object.fromEntries(formData);

        try {
            const res = await createUserWithEmailAndPassword(auth, email, password);
            const imgUrl = await upload(avatar.file);

            const newChatRef = doc(chatRef);
            await setDoc(newChatRef, {
                createdAt: serverTimestamp(),
                messages: []
            });

            await setDoc(doc(db, "users", res.user.uid), {
                username,
                email,
                avatar: imgUrl,
                id: res.user.uid,
                blocked: []
            });

            await updateDoc(doc(db, 'chats', newChatRef.id), {
                messages: arrayUnion({
                  senderId: "88bFaxhvtXbudTkJoW08ynPSJo13",
                  text: "Hello there! I am Yash, the developer of this website. Feel free to shoot me a text.",
                  createdAt: new Date(),
                })
            });

            await setDoc(doc(db, "userchats", res.user.uid), {
                chats: []
            });

            await updateDoc(doc(db, "userchats", res.user.uid), {
                chats:arrayUnion({
                  chatId: newChatRef.id,
                  lastMessage: "",
                  receiverId: "88bFaxhvtXbudTkJoW08ynPSJo13",
                  updatedAt: Date.now()
                })
              });

            await updateDoc(doc(db, "userchats", "88bFaxhvtXbudTkJoW08ynPSJo13"), {
                chats:arrayUnion({
                  chatId: newChatRef.id,
                  lastMessage: "",
                  receiverId: res.user.uid,
                  updatedAt: Date.now()
                })
            });

            toast.success("Account created! You can login now.");
        } catch(err) {
            console.log(err);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

  return (
    <div className='cont'>
        <div className='appName'>
            <h2>Butcher Chat</h2>
        </div>
        <p>If you can't sign in just refresh the page.</p>
        <div className='login'>
            <div className="item">
                <h2>Welcome Back!</h2>
                <form onSubmit={handleLogin}>
                    <input type='text' placeholder='Email' name='email' />
                    <input type='password' placeholder='Password' name='password' />
                    <button disabled={loading}>{loading ? 'Loading' : 'Sign In'}</button>
                </form>
            </div>
            <div className="separator"></div>
            <div className="item">
                <h2>Create an Account</h2>
                <form onSubmit={handleRegister}>
                    <label htmlFor='file'>
                        <img src={avatar.url || './avatar.png'} alt="" />
                        Upload a Picture
                    </label>
                    <input type='file' id='file' style={{display: 'none'}} onChange={handleClick} />
                    <input type='text' placeholder='Username' name='username' />
                    <input type='text' placeholder='Email' name='email' />
                    <input type='password' placeholder='Password' name='password' />
                    <button disabled={loading}>{loading ? 'Loading' : 'Sign Up'}</button>
                </form>
            </div>
        </div>
    </div>
  )
}

export default Login
