const handleRegister = async () => {
  await axios.post("http://localhost:5000/api/user/register", {
    username: Username,      // 👈 match backend field
    email: email,
    password: password,
    displayName: company     // 👈 match backend field
  });
};