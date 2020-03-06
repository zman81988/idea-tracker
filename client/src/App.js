import React, { useState } from "react";
import {
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Link as MaterialLink
} from "@material-ui/core";
import { Menu } from "@material-ui/icons";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect
} from "react-router-dom";

import "./App.css";

import Home from "./Home/Home";

import SignUp from "./Users/SignUp";

import Login from "./Users/Login";
import Profile from "./Users/Profile";

function App() {
  const [user, setUser] = useState({});

  const isLoggedIn = user =>
    !(Object.entries(user).length === 0 && user.constructor === Object);

  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu">
            <Menu />
          </IconButton>
          <Typography className="full-width" variant="h6">
            <MaterialLink component={Link} to="/" style={{ color: "white" }}>
              Home
            </MaterialLink>
          </Typography>
          <Typography className="full-width" variant="h6">
            <MaterialLink href="/oauth/connect" style={{ color: "white" }}>
              Connect to HS
            </MaterialLink>
          </Typography>
          {user.email ? (
            <MaterialLink
              component={Link}
              to="/profile"
              style={{ color: "white" }}
            >
              <Button color="inherit">{`${user.firstName} ${user.lastName}`}</Button>
            </MaterialLink>
          ) : (
            <MaterialLink
              component={Link}
              to="/login"
              style={{ color: "white" }}
            >
              <Button color="inherit">Login</Button>
            </MaterialLink>
          )}
        </Toolbar>
      </AppBar>
      <Switch>
        <Route path="/login">
          <Login setUser={setUser} />
        </Route>
        <Route path="/signup">
          <SignUp setUser={setUser} />
        </Route>
        <Route path="/profile">
          {isLoggedIn(user) ? (
            <Profile user={user} setUser={setUser} />
          ) : (
            <Redirect to="/login" />
          )}
        </Route>
        <Route path="/">
          {isLoggedIn(user) ? <Home user={user} /> : <Redirect to="/login" />}
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
