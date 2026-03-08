import React from 'react';

const ChallengeModal = ({ challenge, onAccept }) => {
    if (!challenge) return null;

    return (
        <div className="modal-overlay">
            <div className="challenge-card">
                <div className="gradient-bar"></div>
                <div className="card-content">
                    <div className="sparkle-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L14.5 9L22 11.5L14.5 14L12 21L9.5 14L2 11.5L9.5 9L12 2Z" fill="#FFD700" stroke="#FFD700" strokeWidth="1" strokeLinejoin="round" />
                            <path d="M19 3L20 5L22 6L20 7L19 9L18 7L16 6L18 5L19 3Z" fill="#FFD700" />
                        </svg>
                    </div>

                    <h2 className="modal-header">YOUR DESIGN CHALLENGE</h2>

                    <div className="challenge-section">
                        <span className="section-label">COMPANY</span>
                        <h3 className="company-name">{challenge.company}</h3>
                    </div>

                    <div className="divider"></div>

                    <div className="challenge-section">
                        <span className="section-label">CONDITION</span>
                        <h3 className="condition-name">{challenge.condition}</h3>
                    </div>

                    <div className="trophy-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 2H16V5H19C20.1 5 21 5.9 21 7V9C21 11.33 19.33 13.29 17.13 13.78C16.44 15.65 14.71 17 12.67 17H11.33C9.29 17 7.56 15.65 6.87 13.78C4.67 13.29 3 11.33 3 9V7C3 5.9 3.9 5 5 5H8V2ZM5 7V9C5 10.1 5.9 11 7 11H8V7H5ZM16 7V11H17C18.1 11 19 10.1 19 9V7H16ZM12 19V17H11V19H7V22H17V19H12Z" fill="#FFD700" />
                        </svg>
                    </div>

                    <button className="accept-btn" onClick={onAccept}>
                        ACCEPT CHALLENGE
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChallengeModal;
