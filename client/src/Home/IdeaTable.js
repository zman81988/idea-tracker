import React, { useEffect } from "react";
import {
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from "@material-ui/core";

const IdeaTable = props => {
  const { ideas, setIdeas } = props;
  useEffect(() => {
    const getIdeas = new Request("/api/ideas");
    const fetchIdeas = async () => {
      const result = await fetch(getIdeas);
      const resultText = await result.json();
      setIdeas(resultText);
    };
    fetchIdeas();
  }, []);
  for (const idea in ideas) {
    console.log(idea.author);
  }
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Idea Title</TableCell>
            <TableCell>Idea Detail</TableCell>
            <TableCell>Date Added</TableCell>
            <TableCell>Author</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {ideas.map(idea => {
            return (
              <TableRow key={idea._id}>
                <TableCell>{idea.title}</TableCell>
                <TableCell>{idea.detail}</TableCell>
                <TableCell>{new Date(idea.date).toDateString()}</TableCell>
                {idea.author ? (
                  typeof idea.author === "string" ? (
                    <TableCell>{idea.author}</TableCell>
                  ) : (
                    <TableCell>
                      {idea.author.firstName + " " + idea.author.lastName}{" "}
                    </TableCell>
                  )
                ) : (
                  <TableCell>Unknown</TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default IdeaTable;
