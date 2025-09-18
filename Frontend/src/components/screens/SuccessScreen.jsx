// src/components/screens/SuccessScreen.jsx
const SuccessScreen = ({ onRestart }) => {
  return (
    <div id="success-screen" className="auth-card active">
      <div className="card-header">
        <div className="security-icon success">
          <i className="fas fa-check-circle"></i>
        </div>
        <h2>Login Successful</h2>
        <p>You have been successfully authenticated</p>
      </div>

      <div className="success-content">
        <div className="welcome-message">
          <h3>Welcome back!</h3>
          <p>You can now access your secure dashboard</p>
        </div>

        <button className="primary-btn" onClick={onRestart}>
          <i className="fas fa-home"></i>
          Go to Dashboard
        </button>
      </div>
    </div>
  )
}

export default SuccessScreen