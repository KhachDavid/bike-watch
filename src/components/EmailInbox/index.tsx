import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, Badge, List, ListItem, Typography } from '@mui/material';
import { Mail as MailIcon, Close as CloseIcon } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../types';
import { markEmailRead } from '../../store/actions/email.actions';
import './styles.scss';

const EmailInbox: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const emails = useSelector((state: RootState) => state.email.emails);
  const unreadCount = useSelector((state: RootState) => state.email.unreadCount);
  const dispatch = useDispatch();

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setSelectedEmail(null);
  };

  const handleEmailClick = (emailId: string) => {
    setSelectedEmail(emailId);
    dispatch(markEmailRead(emailId));
  };

  const selectedEmailData = emails.find(e => e.id === selectedEmail);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return '🚨';
      case 'high': return '⚠️';
      case 'normal': return '📧';
      case 'low': return '📝';
      default: return '📧';
    }
  };

  return (
    <>
      <IconButton onClick={handleOpen} className="email-notification-button">
        <Badge badgeContent={unreadCount} color="error">
          <MailIcon />
        </Badge>
      </IconButton>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth className="email-dialog">
        <DialogTitle className="email-dialog-title">
          <div className="title-content">
            <MailIcon /> Communications
          </div>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent className="email-dialog-content">
          {!selectedEmail ? (
            <div className="email-list-container">
              <div className="inbox-header">
                <Typography variant="h6">Inbox</Typography>
                <Typography variant="caption" color="textSecondary">
                  {unreadCount} unread
                </Typography>
              </div>
              
              <List className="email-list">
                {emails.map((email) => (
                  <ListItem
                    key={email.id}
                    button
                    onClick={() => handleEmailClick(email.id)}
                    className={`email-list-item ${!email.read ? 'unread' : ''}`}
                  >
                    <div className="email-list-item-content">
                      <div className="email-header-row">
                        <span className="email-priority">{getPriorityIcon(email.priority)}</span>
                        <span className="email-from">
                          <strong>{email.fromTitle}</strong>
                        </span>
                        <span className="email-time">
                          {new Date(email.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="email-subject-row">
                        {!email.read && <span className="unread-dot">●</span>}
                        <span className="email-subject">{email.subject}</span>
                      </div>
                    </div>
                  </ListItem>
                ))}
              </List>
            </div>
          ) : (
            <div className="email-detail-container">
              <IconButton onClick={() => setSelectedEmail(null)} size="small" className="back-button">
                ← Back to Inbox
              </IconButton>
              
              {selectedEmailData && (
                <div className="email-detail">
                  <div className="email-detail-header">
                    <div className="email-detail-priority">
                      {getPriorityIcon(selectedEmailData.priority)}
                    </div>
                    <div className="email-detail-meta">
                      <Typography variant="h6" className="email-detail-subject">
                        {selectedEmailData.subject}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        From: <strong>{selectedEmailData.fromTitle}</strong> ({selectedEmailData.from})
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {new Date(selectedEmailData.timestamp).toLocaleString()}
                      </Typography>
                    </div>
                  </div>
                  
                  <div className="email-detail-body">
                    {selectedEmailData.body.split('\n').map((line, index) => (
                      <p key={index}>{line}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EmailInbox;
