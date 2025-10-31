import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import styles from "../../styles/UserManagementModal/UserManagementModal.module.css";
import Button from "../ui/Button";
import Loader from "../ui/Loader";
import FormInputField from "../ui/FormInputField";
import { FormProvider, useForm } from "react-hook-form";
import { API_ENDPOINTS, apiRequest } from "../../config/api";
import ConfirmDialog from "../ui/ConfirmDialoge";

const UserManagementModal = ({ onClose }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });
  const [editingUser, setEditingUser] = useState(null);
  const methods = useForm({
    defaultValues: {
      email: "",
      password: "",
      role: "user",
    },
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await apiRequest(API_ENDPOINTS.GET_USER);
      if (response.success && response.users) {
        const usersArray = Object.entries(response.users).map(
          ([email, userData]) => ({
            email: email,
            ...userData,
          })
        );
        setUsers(usersArray);
      } else {
        toast.error(response.message || "Failed to Fetch users");
        setUsers([]);
      }
    } catch (error) {
      toast.error("Error fetching users" || error.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (data) => {
    try {
      toast.loading("Creating user...");
      const response = await apiRequest(API_ENDPOINTS.CREATE_USER, {
        method: "POST",
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          role: data.role,
        }),
      });
      toast.dismiss();
      if (response.message) {
        toast.success("User created successfully");
        setShowAddUser(false);
        methods.reset();
        fetchUsers();
      } else {
        toast.error(response.message || "Failed to create user");
      }
    } catch (error) {
      toast.dismiss();
      if (error.message==="User Already Exist!") {
        toast.error("User with this email already exits");
      }
      else{
      toast.error(error.message || "Error creating user");
      }
    }
  };

  const handleEditUser = async (userData) => {
    try {
      toast.loading("Updating user...");
      const response = await apiRequest(
        `${API_ENDPOINTS.UPDATE_USER}/${editingUser.email}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            role: userData.role,
            ...(userData.password && { password: userData.password }),
          }),
        }
      );
      toast.dismiss();
      if (response.message) {
        toast.success("User updated successfully!");
        setEditingUser(null);
        fetchUsers();
      } else {
        toast.error(response.message || "Failed to update user");
      }
    } catch (error) {
      toast.dismiss();
      if(error.message==="User not found"){
      toast.error("User not found");
      }else if(error.message==="Required param is missing!"){
        toast.error("Email paramter is required");
      }
      else{
        toast.error(error.message||"Error updating user");
      }
    }
  };

  const handleDeleteUser = async (userEmail) => {
    setConfirmDialog({
      isOpen: true,
      title: "Deactivate User?",
      message: "Are you sure you want to deactivate user?",
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false });

        try {
          toast.loading("Deleting user...");
          const response = await apiRequest(
            `${API_ENDPOINTS.DELETE_USER}/${userEmail}`,
            {
              method: "DELETE",
            }
          );
          toast.dismiss();
          if (response.message) {
            toast.success("User deleted Succcessfullly!");
            fetchUsers();
          } else {
            toast.error(response.message || "Failed to delete user");
          }
        } catch (error) {
          toast.dismiss();
          if(error.message==="user_not_found"){
          toast.error("User not found");
          }else if(error.message==="User is already removed"){
            toast.error("User already removed")
          }else if(error.message==="Missing required param"){
            toast.error("Email paramter is required");
          }else{
            toast.error(error.message||"Failed to delete user")
          }
        }
      },
    });
  };

  const handleResetOTP = async (userEmail) => {
    setConfirmDialog({
      isOpen: true,
      title: "Reset OTP Verification?",
      message: "Reset OTP Verification for this user? They'll need to reverify",
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false });
        try {
          toast.loading("Reseting OTP...");
          const response = await apiRequest(
            `${API_ENDPOINTS.RESET_USER}/${userEmail}`,
            {
              method: "PATCH",
            }
          );
          toast.dismiss();
          if (response.message) {
            toast.success(
              "OTP reset successfully! User will need to verify again."
            );
            fetchUsers();
          } else {
            toast.error(response.message || "Failed to reset OTP");
          }
        } catch (error) {
          toast.dismiss();
          if(error.message==="User not found "){
          toast.error("User not found" || error.message);
        }else if(error.message==="Missing reuiqred param"){
          toast.error("Email parameter required");
        }else{
          toast.error(error.message||"Failed to Reset OTP");
        }
        }
      },
    });
  };

  const EditUserModal = ({ user, onClose, onSave }) => {
    const methods = useForm({
      defaultValues: {
        email: user.email,
        role: user.role,
        password: "",
      },
    });

    const handleSubmit = methods.handleSubmit((formData) => {
      onSave(formData);
    });

    return (
      <div className={styles.editModalOverlay}>
        <div className={styles.editModalContent}>
          <div className={styles.editModalHeader}>
            <h3>Edit User</h3>
            <Button className={styles.closeBtn} onClick={onClose}>
              <i className="fas fa-times"></i>
            </Button>
          </div>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Email Address</label>
                <FormInputField
                  name={"email"}
                  placeholder={"Enter email to edit info"}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Password</label>
                <FormInputField
                  type="password"
                  name={"password"}
                  placeholder={"Enter new password"}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Role</label>
                <select {...methods.register("role")}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className={styles.formActions}>
                <Button type="submit" className={styles.primaryBtn}>
                  Save Changes
                </Button>
                <Button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={onClose}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>

        <div className={styles.modalHeader}>
          <div className={styles.headerTitle}>
            <i className="fas fa-users-cog"></i>
            <h2>User Management</h2>
          </div>
          <Button className={styles.closeBtn} onClick={onClose}>
            <i className="fas fa-times"></i>
          </Button>
        </div>

        <div className={styles.statsContainer}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{users.length}</span>
            <span className={styles.statLabel}>Total Users</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>
              {users.filter((u) => u.is_verified).length}
            </span>
            <span className={styles.statLabel}>2FA Verified</span>
          </div>
        </div>

        <div className={styles.headerActions}>
          <Button
            className={styles.addUserBtn}
            onClick={() => setShowAddUser(true)}
          >
            <i className="fas fa-user-plus"></i>
            Add New User
          </Button>
        </div>

        {showAddUser && (
          <div className={styles.addUserForm}>
            <div className={styles.formHeader}>
              <h3>Add New User</h3>
              <Button
                className={styles.closeFormBtn}
                onClick={() => {
                  setShowAddUser(false);
                  methods.reset();
                }}
              >
                <i className="fas fa-times"></i>
              </Button>
            </div>
            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(handleAddUser)}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Email Address</label>
                    <FormInputField
                      type="email"
                      name={"email"}
                      placeholder="user@example.com"
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Password</label>
                    <FormInputField
                      type="password"
                      name={"password"}
                      placeholder="Enter password"
                      required
                    />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Role</label>
                    <select {...methods.register("role")}>
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                <div className={styles.formActions}>
                  <Button type="submit" className={styles.primaryBtn}>
                    <i className="fas fa-plus"></i>
                    Create User
                  </Button>
                  <Button
                    type="button"
                    className={styles.secondaryBtn}
                    onClick={() => {
                      setShowAddUser(false);
                      methods.reset();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </FormProvider>
          </div>
        )}

        <div className={styles.usersSection}>
          <div className={styles.sectionHeader}>
            <h3>All Users ({users.length})</h3>
          </div>

          <Loader isLoading={loading}>
            {users.length === 0 ? (
              <div className={styles.emptyState}>
                <i className="fas fa-users"></i>
                <h4>No Users Found</h4>
                <p>Get started by adding your first user</p>
              </div>
            ) : (
              <div className={styles.tableContainer}>
                <table className={styles.usersTable}>
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Role</th>
                      <th>2FA Verified</th>
                      <th>Active Users</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.email} className={styles.tableRow}>
                        <td className={styles.emailCell}>{user.email}</td>
                        <td>
                          <span
                            className={`${styles.roleBadge} ${
                              user.role === "admin"
                                ? styles.adminRole
                                : styles.userRole
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`${styles.verification} ${
                              user.is_verified
                                ? styles.verified
                                : styles.notVerified
                            }`}
                          >
                            {user.is_verified ? "Yes" : "No"}
                          </span>
                        </td>
                        <td>
                          <span className={`${styles.activeUsers} ${user.is_deleted?styles.userDeleted:styles.userActive}`}>
                            {user.is_deleted ? "Deleted":"Active"}
                          </span>
                        </td>
                        <td className={styles.actionsCell}>
                          <div className={styles.actionButtons}>
                            <Button
                              className={styles.editBtn}
                              onClick={() => setEditingUser(user)}
                              title="Edit User"
                            >
                              <i className="fas fa-edit"></i>
                            </Button>
                            <Button
                              className={styles.deleteBtn}
                              onClick={() => handleDeleteUser(user.email)}
                              title="Deactivate User"
                            >
                              <i className="fas fa-trash"
                              ></i>
                            </Button>
                            <Button
                              className={styles.resetBtn}
                              onClick={() => handleResetOTP(user.email)}
                              title="Reset OTP Verification"
                            >
                              <i className="fas fa-sync-alt"></i>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Loader>
        </div>

        {editingUser && (
          <EditUserModal
            user={editingUser}
            onClose={() => setEditingUser(null)}
            onSave={handleEditUser}
          />
        )}

        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        />
      </div>
    </div>
  );
};

export default UserManagementModal;
