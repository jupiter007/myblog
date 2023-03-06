import React, { useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useImmer } from 'use-immer';
import Axios from 'axios';
import DispatchContext from '../DispatchContext';
import Post from './Post';
function Search() {
  const appDispatch = useContext(DispatchContext);
  const [state, setState] = useImmer({
    searchTerm: '',
    results: [],
    show: 'neither',
    requestCount: 0,
  });
  useEffect(() => {
    document.addEventListener('keyup', searchKeysPressedHandler);

    return () => {
      document.removeEventListener('keyup', searchKeysPressedHandler);
    };
  }, []);

  useEffect(() => {
    if (state.searchTerm) {
      setState((draft) => {
        draft.show = 'loading';
      });
      const delay = setTimeout(() => {
        setState((draft) => {
          draft.requestCount++;
        });
      }, 700);
      return () => {
        clearTimeout(delay);
      };
    } else {
      setState((draft) => {
        draft.show = 'neither';
      });
    }
  }, [state.searchTerm]);

  useEffect(() => {
    if (state.requestCount) {
      const ourRequest = Axios.CancelToken.source();

      async function fetchResults() {
        try {
          const response = await Axios.post(
            '/search',
            {
              searchTerm: state.searchTerm,
            },
            { cancelToken: ourRequest.token }
          );
          setState((draft) => {
            draft.results = response.data;
            console.log(draft.results);
            draft.show = 'results';
          });
        } catch (e) {
          console.log('There was a problem or request was cancelled.');
        }
      }

      fetchResults();
      return () => {
        ourRequest.cancel();
      };
    }
  }, [state.requestCount]);

  function searchKeysPressedHandler(e) {
    if (e.keyCode === 27) {
      appDispatch({ type: 'closeSearch' });
    }
  }

  function handleInput(e) {
    const text = e.target.value.trim();
    setState((draft) => {
      draft.searchTerm = text;
    });
  }
  return (
    <>
      <div className="search-overlay-top shadow-sm">
        <div className="container container--narrow">
          <label htmlFor="live-search-field" className="search-overlay-icon">
            <i className="fas fa-search"></i>
          </label>
          <input
            autoFocus
            type="text"
            autoComplete="off"
            id="live-search-field"
            className="live-search-field"
            placeholder="What are you interested in?"
            onChange={handleInput}
          />
          <span
            onClick={() => appDispatch({ type: 'closeSearch' })}
            className="close-live-search"
          >
            <i className="fas fa-times-circle"></i>
          </span>
        </div>
      </div>

      <div className="search-overlay-bottom">
        <div className="container container--narrow py-3">
          <div
            className={
              'circle-loader ' +
              (state.show === 'loading' ? 'circle-loader--visible' : '')
            }
          ></div>
          <div
            className={
              'live-search-results' +
              (state.show === 'results' ? 'live-search-results--visible' : '')
            }
          >
            {Boolean(state.results.length) && (
              <div className="list-group shadow-sm">
                <div className="list-group-item active">
                  <strong>Search Results</strong> ({state.results.length}{' '}
                  {Boolean(state.results.length) > 1 ? 'items ' : 'item '}
                  found)
                </div>
                {state.results.map((post) => {
                  return (
                    <Post
                      post={post}
                      key={post._id}
                      onClick={() => appDispatch({ type: 'closeSearch' })}
                    />
                  );
                })}
              </div>
            )}
            {!Boolean(state.results.length) && (
              <p className="alert alert-danger text-center shadow-sm">
                Sorry, we could not find any results for that search.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Search;
