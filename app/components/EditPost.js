import React, { useEffect, useState, useContext } from 'react';
import { useImmerReducer } from 'use-immer';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Page from './Page';
import Axios from 'axios';
import LoadingDotsIcon from './LoadingDotsIcon';
import StateContext from '../StateContext';
import DispatchContext from '../DispatchContext';
import NotFound from './NotFound';

function EditPost() {
  const navigate = useNavigate();
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);

  const originalState = {
    title: {
      value: '',
      hasError: false,
      message: '',
    },
    body: {
      value: '',
      hasError: false,
      message: '',
    },
    isFetching: true,
    isSaving: false,
    id: useParams().id,
    sendCount: 0,
    notFound: false,
  };

  function ourReducer(draft, action) {
    switch (action.type) {
      case 'fetchComplete':
        draft.title.value = action.value.title;
        draft.body.value = action.value.body;
        draft.isFetching = false;
        return;
      case 'titleChange':
        draft.title.value = action.value;
        draft.title.hasError = false;
        return;
      case 'bodyChange':
        draft.body.value = action.value;
        draft.body.hasError = false;
        return;
      case 'submitRequest':
        if (!draft.title.hasError && !draft.body.hasError) {
          draft.sendCount++;
        }
        return;
      case 'saveRequestStarted':
        draft.isSaving = true;
        return;
      case 'saveRequestFinished':
        draft.isSaving = false;
        return;
      case 'titleRules':
        if (!action.value.trim()) {
          draft.title.hasError = true;
          draft.title.message = 'You must provide a title';
        }
        return;
      case 'bodyRules':
        if (!action.value.trim()) {
          draft.body.hasError = true;
          draft.body.message = 'You must provide body';
        }
        return;
      case 'notFound':
        draft.notFound = true;
        return;
      default:
        return draft;
    }
  }
  const [state, dispatch] = useImmerReducer(ourReducer, originalState);

  function submitHandler(e) {
    e.preventDefault();
    dispatch({ type: 'titleRules', value: state.title.value });
    dispatch({ type: 'submitRequest' });
  }
  useEffect(() => {
    async function fetchPost() {
      try {
        const response = await Axios.get(`/post/${state.id}`);
        if (response.data) {
          dispatch({ type: 'fetchComplete', value: response.data });
          if (appState.user.username !== response.data.auther.username) {
            appDispatch({
              type: 'flashMessage',
              value: 'You do not have permission to edit that post',
            });
            // redirect to home page
            navigate('/');
          }
        } else {
          dispatch({ type: 'notFound' });
        }
      } catch (e) {
        console.log('There was a problem.');
      }
    }
    fetchPost();
  }, []);

  useEffect(() => {
    if (state.sendCount) {
      dispatch({ type: 'saveRequestStarted' });
      async function fetchPost() {
        try {
          const response = await Axios.post(`/post/${state.id}/edit`, {
            title: state.title.value,
            body: state.body.value,
            token: appState.user.token,
          });
          dispatch({ type: 'saveRequestFinished' });
          appDispatch({ type: 'flashMessage', value: 'Post was updated!' });
          // dispatch({ type: 'fetchComplete', value: response.data });
        } catch (e) {
          console.log('There was a problem.');
        }
      }
      fetchPost();
    }
  }, [state.sendCount]);

  if (state.notFound) {
    return <NotFound />;
  }
  if (state.isFetching) {
    return (
      <Page title="...">
        <LoadingDotsIcon />
      </Page>
    );
  }

  return (
    <Page title="Edit Post">
      <Link className="small font-weight-bold" to={`/post/${state.id}`}>
        &laquo; Back to post permalink
      </Link>
      <form className="mt-3" onSubmit={submitHandler}>
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
            value={state.title.value}
            onChange={(e) =>
              dispatch({ type: 'titleChange', value: e.target.value })
            }
            onBlur={(e) =>
              dispatch({ type: 'titleRules', value: e.target.value })
            }
          />
          {state.title.hasError && (
            <div className="alert alert-danger small liveValidateMessage">
              {state.title.message}
            </div>
          )}
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
            value={state.body.value}
            onChange={(e) =>
              dispatch({ type: 'bodyChange', value: e.target.value })
            }
            onBlur={(e) =>
              dispatch({ type: 'bodyRules', value: e.target.value })
            }
          />
          {state.body.hasError && (
            <div className="alert alert-danger small liveValidateMessage">
              {state.body.message}
            </div>
          )}
        </div>

        <button className="btn btn-primary" disabled={state.isSaving}>
          Save Updates
        </button>
      </form>
    </Page>
  );
}

export default EditPost;
