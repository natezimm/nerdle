import React, { useEffect } from 'react';
import '../styles/Alert.css';

const Alert = ({ message, isOpen, onClose, duration = 2000 }) => {
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isOpen, duration, onClose]);

    if (!isOpen) return null;

    return (
        <div className="alert-container">
            <div className="alert-toast">
                {message}
            </div>
        </div>
    );
};

export default Alert;
