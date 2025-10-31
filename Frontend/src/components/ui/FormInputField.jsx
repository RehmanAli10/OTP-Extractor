import { useState } from "react";
import { useFormContext } from "react-hook-form";
import styles from "../../styles/FormInputField/FormInputField.module.css";

const FormInputField = ({
  name,
  label,
  type = "text",
  placeholder,
  rules,
  icon,
  id,
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const [showPassword, setShowPassword] = useState(false);

  const isPasswordField = type === "password";

  const inputType = isPasswordField && showPassword ? "text" : type;

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={styles.formGroup}>
      {label && <label htmlFor={name}>{label}</label>}

      <div className={styles.inputField}>
        {icon && <i className={icon}></i>}
        <input
          id={id || name}
          type={inputType}
          placeholder={placeholder}
          {...register(name, rules)}
          className={errors[name] ? styles.error : ""}
        />

        {isPasswordField && (
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={togglePasswordVisibility}
          >
            <i
              className={`fas ${showPassword ? "fa-eye" : "fa-eye-slash"}`}
            ></i>
          </button>
        )}
      </div>

      {errors[name] && (
        <div className={`${styles.errorMessage} ${styles.show}`}>
          {errors[name].message}
        </div>
      )}
    </div>
  );
};

export default FormInputField;
