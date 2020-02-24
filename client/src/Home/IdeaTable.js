import React, { useState, useEffect } from "react";
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
      console.log(resultText);
      setIdeas(resultText);
    };
    fetchIdeas();
  }, []);
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Idea Title</TableCell>
            <TableCell>Idea Detail</TableCell>
            <TableCell>Number of Comments</TableCell>
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
                <TableCell>{idea.comments.length}</TableCell>
                <TableCell>{idea.date}</TableCell>
                <TableCell>{idea.author}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default IdeaTable;
