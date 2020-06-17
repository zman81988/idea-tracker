import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Paper, Grid } from "@material-ui/core";

const SingleIdea = (props) => {
  const { ideaId } = useParams();
  const [idea, setIdea] = useState({
    detail: "",
    title: "",
    author: { firstName: "", lastName: "" },
  });
  useEffect(() => {
    const getIdea = new Request(`/api/ideas/${ideaId}`);
    const fetchIdea = async () => {
      const result = await fetch(getIdea);
      const resultText = await result.json();
      console.log(resultText);
      setIdea(resultText);
    };
    fetchIdea();
  }, [ideaId, setIdea]);
  console.log(idea);
  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper>Title: {idea.title}</Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper>Detail: {idea.title}</Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper>
            Author: {idea.author.firstName} {idea.author.lastName}
          </Paper>
        </Grid>
      </Grid>
    </>
  );
  // return <pre>{JSON.stringify(idea, null, 4)}</pre>;
};

export default SingleIdea;
