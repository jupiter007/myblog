import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Axios from 'axios';
import LoadingDotsIcon from './LoadingDotsIcon';

function ProfileFollowers() {
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const { username } = useParams();

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await Axios.get(`/profile/${username}/followers`);
        setPosts(response.data);
        setIsLoading(false);
        console.log(response.data);
      } catch (e) {
        console.log('There was a problem.');
      }
    }
    fetchPosts();
  }, [username]);

  if (isLoading) {
    return <LoadingDotsIcon />;
  }

  if (!posts.length) {
    return (
      <p className="text-muted text-center">You are not following anybody</p>
    );
  }

  return (
    <div className="list-group">
      {posts.map((follower, index) => {
        return (
          <Link
            key={index}
            to={`/profile/${follower.username}`}
            className="list-group-item list-group-item-action"
          >
            <img className="avatar-tiny" src={follower.avatar} />{' '}
            {follower.username}
          </Link>
        );
      })}
    </div>
  );
}

export default ProfileFollowers;
