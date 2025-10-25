import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, Badge, Avatar } from '@mui/material';
import { Twitter as TwitterIcon, Close as CloseIcon } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../types';
import { SOCIAL_ACTION_TYPES } from '../../store/reducers/social.reducer';
import { selectStreet } from '../../store/actions/game.actions';
import './styles.scss';

const SocialFeed: React.FC = () => {
  const [open, setOpen] = useState(false);
  const posts = useSelector((state: RootState) => state.social.posts);
  const unreadCount = useSelector((state: RootState) => state.social.unreadCount);
  const streets = useSelector((state: RootState) => state.game.streets);
  const dispatch = useDispatch();

  const handleOpen = () => {
    setOpen(true);
    dispatch({ type: SOCIAL_ACTION_TYPES.MARK_ALL_READ });
  };

  const handleClose = () => setOpen(false);

  const handleNeighborhoodClick = (neighborhoodName: string) => {
    // Find the street by name
    const street = streets.find(s => s.name === neighborhoodName);
    if (street) {
      // Select the street and trigger map centering
      dispatch(selectStreet(street.id));
      // Close the social feed dialog
      handleClose();
      // Notify parent to switch to map view - we'll use a custom event
      window.dispatchEvent(new CustomEvent('switchToMapView', { detail: { streetId: street.id } }));
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'angry': return '#dc2626';
      case 'sarcastic': return '#ea580c';
      case 'frustrated': return '#d97706';
      case 'concerned': return '#ca8a04';
      case 'disappointed': return '#65a30d';
      case 'hopeful': return '#16a34a';
      case 'brutal': return '#991b1b'; // Dark red
      case 'positive': return '#059669'; // Green
      default: return '#6b7280';
    }
  };

  const getSentimentEmoji = (sentiment: string) => {
    switch (sentiment) {
      case 'angry': return '😠';
      case 'sarcastic': return '🙄';
      case 'frustrated': return '😤';
      case 'concerned': return '😟';
      case 'disappointed': return '😔';
      case 'hopeful': return '🙏';
      case 'brutal': return '💀';
      case 'positive': return '✨';
      default: return '💬';
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  return (
    <>
      <IconButton onClick={handleOpen} className="social-notification-button">
        <Badge badgeContent={unreadCount > 99 ? '99+' : unreadCount} color="error">
          <TwitterIcon />
        </Badge>
      </IconButton>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth className="social-dialog">
        <DialogTitle className="social-dialog-title">
          <div className="title-content">
            <TwitterIcon /> Public Reactions
            <span className="post-count">{posts.length.toLocaleString()} posts</span>
          </div>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent className="social-dialog-content">
          <div className="social-feed">
            {posts.map((post) => (
              <div key={post.id} className="social-post">
                <div className="post-header">
                  <Avatar 
                    src={post.avatar} 
                    alt={post.displayName}
                    className="post-avatar"
                    sx={{ width: 40, height: 40 }}
                  />
                  <div className="post-meta">
                    <div className="post-author">
                      <span className="display-name">{post.displayName}</span>
                      <span className="username">{post.username}</span>
                      <span className="timestamp">· {formatTimestamp(post.timestamp)}</span>
                    </div>
                  </div>
                  <span 
                    className="sentiment-indicator"
                    style={{ color: getSentimentColor(post.sentiment) }}
                    title={post.sentiment}
                  >
                    {getSentimentEmoji(post.sentiment)}
                  </span>
                </div>
                <div className="post-content">
                  {post.content}
                </div>
                {post.neighborhood && (
                  <div 
                    className="post-tag clickable-neighborhood" 
                    onClick={() => handleNeighborhoodClick(post.neighborhood!)}
                    title={`Click to view ${post.neighborhood} on map`}
                  >
                    📍 {post.neighborhood}
                  </div>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SocialFeed;
