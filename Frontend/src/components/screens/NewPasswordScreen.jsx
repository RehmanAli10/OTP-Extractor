import { useState } from 'react'
import Loader from '../ui/Loader'
import styles from "../../styles/NewPassword/NewPassword.module.css"

const NewPasswordScreen = ({ onPasswordReset, showToast }) => {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
    if (name === 'confirmPassword' && errors.confirmPassword && value === formData.newPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.newPassword) {
      newErrors.newPassword = 'Please enter a new password'
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters long'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      showToast('Please fix the errors in the form', 'error')
      return
    }

    setIsLoading(true)
    try {
      await onPasswordReset(formData.newPassword, formData.confirmPassword)
    } catch (error) {
      showToast('Failed to reset password. Please try again.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div id="new-password-screen" className={`${styles.authCard}${styles.active}`}>
      <div className={styles.cardHeader}>
        <div className={styles.securityIcon}>
          <i className="fas fa-lock"></i>
        </div>
        <h2>Set New Password</h2>
        <p>Create a strong password for your account</p>
      </div>

      <Loader isLoading={isLoading}>
        <form className={styles.authForm} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="new-password">New Password</label>
            <div className={styles.inputField}>
              <i className="fas fa-lock"></i>
              <input
                type="password"
                id="new-password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="Enter new password"
                required
                className={errors.newPassword ? styles.error : ''}
              />
            </div>
            {errors.newPassword && <div className={`${styles.errorMessage}${styles.show}`}>{errors.newPassword}</div>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirm-password">Confirm New Password</label>
            <div className={styles.inputField}>
              <i className="fas fa-lock"></i>
              <input
                type="password"
                id="confirm-password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm new password"
                required
                className={errors.confirmPassword ? styles.error : ''}
              />
            </div>
            {errors.confirmPassword && <div className={`${styles.errorMessage}${styles.show}`}>{errors.confirmPassword}</div>}
          </div>

          <button type="submit" className={styles.primaryBtn} disabled={isLoading}>
            <i className="fas fa-check"></i>
            Reset Password
          </button>
        </form>
      </Loader>
    </div>
  )
}

export default NewPasswordScreen