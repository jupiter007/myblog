import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Axios from 'axios';
import Page from './Page';
import DispatchContext from '../DispatchContext';
import StateContext from '../StateContext';

function CreatePost() {
  const [title, setTitle] = useState();
  const [body, setBody] = useState();
  const navigate = useNavigate();
  const dispatch = useContext(DispatchContext);
  const appState = useContext(StateContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = appState.user.token;
    try {
      const response = await Axios.post('/create-post', {
        title,
        body,
        token,
      });
      dispatch({
        type: 'flashMessage',
        value: 'Congrats! You successfully created a post!',
      });
      // Redirect to new post url
      navigate(`/post/${response.data}`);
      console.log('new post was created');
    } catch (e) {
      console.log('There was a problem');
    }
  };
  return (
    <Page title="Create New Post">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="post-title" className="text-muted mb-1">
            <small>Title</small>
          </label>
          <input
            autoFocus
            name="title"
            id="post-title"
            className="form-control form-control-lg form-control-title"
            type="text"
            placeholder=""
            autoComplete="off"
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="post-body" className="text-muted mb-1 d-block">
            <small>Body Content</small>
          </label>
          <textarea
            name="body"
            id="post-body"
            className="body-content tall-textarea form-control"
            type="text"
            onChange={(e) => setBody(e.target.value)}
          ></textarea>
        </div>

        <button className="btn btn-primary">Save New Post</button>
      </form>
    </Page>
  );
}

export default CreatePost;
