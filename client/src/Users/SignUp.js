import React, { useState } from "react";
import {
  TextField,
  Button,
  Container,
  IconButton,
  Snackbar
} from "@material-ui/core";
import { Close } from "@material-ui/icons";
import { Redirect } from "react-router-dom";

const SignUp = props => {
  const { setUser } = props;
  const [potentialUser, setPotentialUser] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    rank: ""
  });

  const [signUpSuccess, setSignUpSuccess] = useState(false);

  const [passwordsMatch, setPasswordsMatch] = useState(false);
  const onChange = e => {
    setPotentialUser({ ...potentialUser, [e.target.id]: e.target.value });
    if (e.target.id === "confirmPassword" || e.target.id === "password") {
      if (potentialUser.password === potentialUser.confirmPassword) {
        setPasswordsMatch(true);
      } else {
        setPasswordsMatch(false);
      }
    }
  };
  const onSubmit = async e => {
    e.preventDefault();
    const userSignUpHeaders = new Headers();
    userSignUpHeaders.append("Content-Type", "application/json");
    const body = JSON.stringify(potentialUser);

    const userSignUpOptions = {
      method: "POST",
      headers: userSignUpHeaders,
      body
    };
    const userSignUpRequest = new Request("/api/users/", userSignUpOptions);
    const response = await fetch(userSignUpRequest);
    if (response.status === 200) {
      const responseJSON = await response.json();
      setUser(responseJSON.savedUser);
      setSignUpSuccess(true);
    } else if (response.status === 409) {
      setOpen(true);
      setMessage("Email already exists.");
    } else {
      setOpen(true);
      setMessage("Uh oh, something went wrong");
    }
  };

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("failed to sign up");

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  return (
    <Container>
      <form onSubmit={onSubmit}>
        <TextField
          label="First Name"
          id="firstName"
          onChange={onChange}
          name="firstName"
          value={potentialUser.firstName}
          fullWidth
        ></TextField>
        <TextField
          label="Last Name"
          id="lastName"
          onChange={onChange}
          name="lastName"
          value={potentialUser.lastName}
          fullWidth
        ></TextField>
        <TextField
          label="rank"
          id="rank"
          onChange={onChange}
          name="rank"
          value={potentialUser.rank}
          fullWidth
        ></TextField>
        <TextField
          label="email"
          id="email"
          onChange={onChange}
          name="email"
          value={potentialUser.email}
          autoComplete="username"
          fullWidth
        ></TextField>

        <TextField
          label="password"
          id="password"
          onChange={onChange}
          name="password"
          value={potentialUser.password}
          type="password"
          autoComplete="new-password"
          fullWidth
        ></TextField>
        <TextField
          label="Confirm Password"
          id="confirmPassword"
          onChange={onChange}
          name="confirmPassword"
          value={potentialUser.confirmPassword}
          type="password"
          autoComplete="new-password"
          fullWidth
        ></TextField>
        <Button
          variant="outlined"
          color="primary"
          type="submit"
          disabled={passwordsMatch}
        >
          Login
        </Button>
      </form>
      {signUpSuccess ? (
        <Redirect push to="/" />
      ) : (
        <Snackbar
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left"
          }}
          open={open}
          autoHideDuration={6000}
          onClose={handleClose}
          message={message}
          action={
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleClose}
            >
              <Close fontSize="small" />
            </IconButton>
          }
        />
      )}
    </Container>
  );
};

export default SignUp;
