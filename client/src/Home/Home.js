import React, { useState } from "react";
import { Grid, Container } from "@material-ui/core";
import CreateIdea from "./CreateIdea";
import IdeaTable from "./IdeaTable";

const Home = props => {
  const { user } = props;
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
              user={user}
            />
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home;
