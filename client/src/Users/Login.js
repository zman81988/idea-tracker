import React, { useState } from "react";
import {
  TextField,
  Button,
  Container,
  IconButton,
  Snackbar,
  Link as MaterialLink
} from "@material-ui/core";
import { Close } from "@material-ui/icons";
import { Redirect, Link } from "react-router-dom";

const Login = props => {
  const { setUser } = props;
  const [potentialUser, setPotentialUser] = useState({
    email: "",
    password: ""
  });

  const onChange = e => {
    setPotentialUser({ ...potentialUser, [e.target.id]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    const userLoginHeaders = new Headers();
    userLoginHeaders.append("Content-Type", "application/json");
    const body = JSON.stringify(potentialUser);

    const userLoginOptions = {
      method: "POST",
      headers: userLoginHeaders,
      body
    };
    const userLoginRequest = new Request("/api/users/login", userLoginOptions);
    const response = await fetch(userLoginRequest);
    console.log(response.status);
    if (response.status === 200) {
      setUser(await response.json());
      setLoginSuccess(true);
    } else {
      setLoginSuccess(false);
      setOpen(true);
    }
  };

  const [loginSuccess, setLoginSuccess] = useState(false);
  const [open, setOpen] = useState(false);

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
          label="email"
          id="email"
          onChange={onChange}
          name="email"
          value={setPotentialUser.email}
          autoComplete="username"
          fullWidth
        ></TextField>
        <TextField
          label="password"
          id="password"
          onChange={onChange}
          name="password"
          value={setPotentialUser.password}
          type="password"
          autoComplete="current-password"
          fullWidth
        ></TextField>
        <Button variant="outlined" color="primary" type="submit">
          Login
        </Button>
      </form>
      <MaterialLink component={Link} to="/signup">
        No login? SignUp
      </MaterialLink>
      {loginSuccess ? (
        <Redirect push to="/" />
      ) : (
        <Snackbar
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center"
          }}
          open={open}
          autoHideDuration={6000}
          onClose={handleClose}
          message="Failed to login"
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

export default Login;
