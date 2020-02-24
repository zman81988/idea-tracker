import React, { useState, useEffect } from "react";
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
  const { user, setUser } = props;
  setUser({
    email: "",
    password: "",
    confirmPassword: "",
    firstname: "",
    lastname: ""
  });

  const [signUpSuccess, setSignUpSuccess] = useState(false);

  const [passwordsMatch, setPasswordsMatch] = useState(false);
  const onChange = e => {
    setUser({ ...user, [e.target.id]: e.target.value });
    if (e.target.id === "confirmPassword" || e.target.id === "password") {
      if (user.password === user.confirmPassword) {
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
    const body = JSON.stringify(user);

    const userSignUpOptions = {
      method: "POST",
      headers: userSignUpHeaders,
      body
    };
    const userSignUpRequest = new Request("/api/users/", userSignUpOptions);
    const response = await fetch(userSignUpRequest);
    if (response.status === 200) {
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
          label="firstname"
          id="firstname"
          onChange={onChange}
          name="firstname"
          value={user.firstname}
          fullWidth
        ></TextField>
        <TextField
          label="lastname"
          id="lastname"
          onChange={onChange}
          name="lastname"
          value={user.lastname}
          fullWidth
        ></TextField>
        <TextField
          label="email"
          id="email"
          onChange={onChange}
          name="email"
          value={user.email}
          autoComplete="username"
          fullWidth
        ></TextField>

        <TextField
          label="password"
          id="password"
          onChange={onChange}
          name="password"
          value={user.password}
          type="password"
          autoComplete="new-password"
          fullWidth
        ></TextField>
        <TextField
          label="confirmPassword"
          id="confirmPassword"
          onChange={onChange}
          name="confirmPassword"
          value={user.confirmPassword}
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
