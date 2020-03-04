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

const Profile = props => {
  const { user, setUser } = props;
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const onChange = e => {
    setUser({ ...user, [e.target.id]: e.target.value });
  };
  const [open, setOpen] = useState(false);
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };
  const [message, setMessage] = useState("failed to update user profile");
  const onSubmit = async e => {
    e.preventDefault();
    const userEditHeaders = new Headers();
    userEditHeaders.append("Content-Type", "application/json");
    const body = JSON.stringify(user);

    const userEditOptions = {
      method: "PUT",
      headers: userEditHeaders,
      body
    };
    const userEditRequest = new Request("/api/users/", userEditOptions);
    const response = await fetch(userEditRequest);
    if (response.status === 200) {
      const responseJSON = await response.json();
      console.log(responseJSON.updatedUser);
      setUser(responseJSON.updatedUser);
      setUpdateSuccess(true);
    } else if (response.status === 409) {
      setOpen(true);
      setMessage("Email already exists.");
    } else {
      setOpen(true);
      setMessage("Uh oh, something went wrong");
    }
  };

  return (
    <Container>
      <form onSubmit={onSubmit}>
        <TextField
          label="First Name"
          id="firstName"
          onChange={onChange}
          name="firstName"
          value={user.firstName}
          fullWidth
        ></TextField>
        <TextField
          label="Last Name"
          id="lastName"
          onChange={onChange}
          name="lastName"
          value={user.lastName}
          fullWidth
        ></TextField>
        <TextField
          label="rank"
          id="rank"
          onChange={onChange}
          name="rank"
          value={user.rank}
          fullWidth
        ></TextField>
        <TextField
          label="email"
          id="email"
          onChange={onChange}
          name="email"
          value={user.email}
          fullWidth
        ></TextField>
        <Button variant="outlined" color="primary" type="submit">
          Update
        </Button>
      </form>
      {updateSuccess ? (
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

export default Profile;
