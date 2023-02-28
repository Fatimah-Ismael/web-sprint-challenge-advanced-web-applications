import React, { useState } from 'react'
import { NavLink, Routes, Route, useNavigate } from 'react-router-dom'
import Articles from './Articles'
import LoginForm from './LoginForm'
import Message from './Message'
import ArticleForm from './ArticleForm'
import Spinner from './Spinner'
import { axiosWithAuth } from '../axios'
import PrivateRoute from './PrivateRoute'
import axios from 'axios'

const articlesUrl = 'http://localhost:9000/api/articles'
const loginUrl = 'http://localhost:9000/api/login'

export default function App() {
  // ✨ MVP can be achieved with these states
  const [message, setMessage] = useState('')
  const [articles, setArticles] = useState([])
  const [currentArticleId, setCurrentArticleId] = useState(null)
  const [spinnerOn, setSpinnerOn] = useState(false)

  // ✨ Research `useNavigate` in React Router v.6
  const navigate = useNavigate()
  const redirectToLogin = () => { navigate('/') }
  const redirectToArticles = () => { navigate('/articles')} 

  const logout = () => {
    if(localStorage.getItem('token')) {
      localStorage.removeItem('token');
      setMessage('Goodbye!');
      redirectToLogin();
    }
    // ✨ implement
    // If a token is in local storage it should be removed,
    // and a message saying "Goodbye!" should be set in its proper state.
    // In any case, we should redirect the browser back to the login screen,
    // using the helper above.
  }

  const login = ( values ) => {
    setMessage('');
    setSpinnerOn(true);
    axios.post(loginUrl, values)
      .then(res=> {
        localStorage.setItem('token', res.data.token);
        setMessage(res.data.message);
        redirectToArticles();
        getArticles();
      })
      .catch(err=>{
        setMessage('');
        setSpinnerOn(false);
        console.log(err);
      })

    // ✨ implement
    // We should flush the message state, turn on the spinner
    // and launch a request to the proper endpoint.
    // On success, we should set the token to local storage in a 'token' key,
    // put the server success message in its proper state, and redirect
    // to the Articles screen. Don't forget to turn off the spinner!
  }

  const getArticles = () => {
    setMessage('');
    setSpinnerOn(true);
    axiosWithAuth()
      .get(articlesUrl)
        .then(res=> {
          setMessage(res.data.message);
          setArticles(res.data.articles);
          setSpinnerOn(false);
        })
          .catch(err => {
            setMessage('');
            if(err.res.status === 401) navigate('/');
            setSpinnerOn(false);
            console.log(err);
          })
    // ✨ implement
    // We should flush the message state, turn on the spinner
    // and launch an authenticated request to the proper endpoint.
    // On success, we should set the articles in their proper state and
    // put the server success message in its proper state.
    // If something goes wrong, check the status of the response:
    // if it's a 401 the token might have gone bad, and we should redirect to login.
    // Don't forget to turn off the spinner!
  }

  const postArticle = article => {
    console.log(article);
    setMessage('');
    setSpinnerOn(true);
    axiosWithAuth()
      .post(articlesUrl, article)
        .then(res => {
          //console.log(res)
          setMessage(res.data.message);
          setArticles( [...articles, res.data.article]);
          setSpinnerOn(false);
        })
        .catch(err => {
          setMessage('');
          if(err.res.status === 401) navigate('/');
          setSpinnerOn(false);
          console.log(err);
        })
    // ✨ implement
    // The flow is very similar to the `getArticles` function.
    // You'll know what to do! Use log statements or breakpoints
    // to inspect the response from the server.
  }

  const updateArticle = (article) => {
    setMessage('');
    axiosWithAuth()
    .put(`${articlesUrl}/${article.article_id}`, {title: article.title, text: article.text, topic: article.topic})
      .then(res=>{
        setMessage(res.data.message);
        setSpinnerOn(false);
        const updatedArt= articles.map(el => {
          if(el.article_id === article.article_id)
          return {...el, title:article.title, text:article.text, topic:article.topic};
          return el;
        });
        setArticles(updatedArt);
      })
        .catch(err => {
          setMessage('');
          console.log(err);
          setSpinnerOn(false);
        })
    // ✨ implement
    // You got this!
  }

  const deleteArticle = article_id => {
    setMessage('');
    axiosWithAuth()
      .delete(`${articlesUrl}/${article_id}`)
        .then(res => {
          console.log(res)
          setMessage(res.data.message);
          const filteredArticles = articles.filter(el=> el.article_id !== article_id);
          setArticles(filteredArticles);
          setSpinnerOn(false);
        })
        .catch(err => {
          console.error(err);
          setMessage('');
          setSpinnerOn(false);
        })
  }

  return (
    // ✨ fix the JSX: `Spinner`, `Message`, `LoginForm`, `ArticleForm` and `Articles` expect props ❗
    <>
      <Spinner on={spinnerOn}/>
      <Message message={message}/>
      <button id="logout" onClick={logout}>Logout from app</button>
      <div id="wrapper" style={{ opacity: spinnerOn ? "0.25" : "1" }}> {/* <-- do not change this line */}
        <h1>Advanced Web Applications</h1>
        <nav>
          <NavLink id="loginScreen" to="/">Login</NavLink>
          <NavLink id="articlesScreen" to="/articles">Articles</NavLink>
        </nav>
        <Routes>
          <Route path="/" element={<LoginForm login={login}/>} />
          <Route element={<PrivateRoute />}>
          <Route path="articles" element={
            <>
              <ArticleForm 
              postArticle={postArticle}
              articles={articles}
              currentArticleId={currentArticleId}
              updateArticle={updateArticle}
              setCurrentArticleId={setCurrentArticleId}
              setSpinnerOn={setSpinnerOn}
              />
              <Articles 
              deleteArticle={deleteArticle}
              articles={articles}
              currentArticleId={currentArticleId}
              getArticles={getArticles}
              setCurrentArticleId={setCurrentArticleId}
              setSpinnerOn={setSpinnerOn}
              />
            </>
          } />
          </Route>
        </Routes>
        <footer>Bloom Institute of Technology 2022</footer>
      </div>
    </>
  )
}
