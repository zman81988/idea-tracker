import React from "react";
import { TextField, Button, Paper } from "@material-ui/core";

const CreateIdea = props => {
  const { idea, ideas, setIdea, setIdeas, user } = props;

  const onChange = e => {
    setIdea({ ...idea, [e.target.id]: e.target.value });
  };
  const addIdea = async e => {
    e.preventDefault();
    const addIdeaHeaders = new Headers();
    addIdeaHeaders.append("Content-Type", "application/json");
    idea.author = user._id;
    const body = JSON.stringify(idea);

    const addIdeaOptions = {
      method: "POST",
      headers: addIdeaHeaders,
      body
    };
    const addIdeaRequest = new Request("/api/ideas", addIdeaOptions);
    const response = await fetch(addIdeaRequest);
    const responseText = await response.json();
    setIdeas([...ideas, responseText]);
    setIdea({ detail: "", title: "" });
    //console.log(responseText);
  };
  return (
    <Paper>
      <form onSubmit={addIdea}>
        <TextField
          label="Idea title"
          id="title"
          onChange={onChange}
          value={idea.title}
          fullWidth
        ></TextField>
        <TextField
          label="Idea Body"
          id="detail"
          value={idea.detail}
          onChange={onChange}
          multiline
          rows="4"
          fullWidth
        ></TextField>
        <Button variant="outlined" color="primary" type="submit">
          Add Idea
        </Button>
      </form>
    </Paper>
  );
};

export default CreateIdea;
