import React, { useState, useEffect } from "react";
import { Grid, Container } from "@material-ui/core";
import CreateIdea from "./CreateIdea";
import IdeaTable from "./IdeaTable";

const Home = () => {
  const [ideas, setIdeas] = useState([]);
  const [idea, setIdea] = useState({ detail: "", title: "" });
  return (
    <Container>
      <Grid container>
        <Grid container spacing={4}>
          <Grid item xs={8}>
            <IdeaTable ideas={ideas} setIdeas={setIdeas} />
          </Grid>
          <Grid item xs={4}>
            <CreateIdea
              setIdea={setIdea}
              setIdeas={setIdeas}
              idea={idea}
              ideas={ideas}
            />
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home;
