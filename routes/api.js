'use strict';

const SudokuSolver = require('../controllers/sudoku-solver.js');

module.exports = function (app) {
  
  // Get the sudoku solver.
  let solver = new SudokuSolver();

  app.route('/api/check')
    .post((req, res) => {
      const { puzzle, coordinate, value } = req.body;

      // 1) Required fields
      if (puzzle === undefined || coordinate === undefined || value === undefined) {
        return res.json({ error: "Required field(s) missing" });
      }

      // 2) Validate puzzle length and characters
      if (puzzle.length !== 81) {
        return res.json({ error: "Expected puzzle to be 81 characters long" });
      }
      if (/[^1-9.]/.test(puzzle)) {
        return res.json({ error: "Invalid characters in puzzle" });
      }

      // 3) Validate coordinate and value format
      if (!/^[A-Ia-i][1-9]$/.test(coordinate)) {
        return res.json({ error: "Invalid coordinate" });
      }
      if (!/^[1-9]$/.test(value)) {
        return res.json({ error: "Invalid value" });
      }

      // 4) Extract row & column
      const row = coordinate[0].toUpperCase();
      const col = parseInt(coordinate[1], 10);

      // 5) If the same value already sits in that cell, it's valid.
      if (solver.checkDuplicateValue(puzzle, row, col, value)) {
        return res.json({ valid: true });
      }

      // 6) Check all three rules
      const validRow = solver.checkRowPlacement(puzzle, row, col, value);
      const validCol = solver.checkColPlacement(puzzle, row, col, value);
      const validReg = solver.checkRegionPlacement(puzzle, row, col, value);

      // 7) If no conflicts at all
      if (validRow && validCol && validReg) {
        return res.json({ valid: true });
      }

      // 8) Build conflicts array
      const conflict = [];
      if (!validRow) conflict.push("row");
      if (!validCol) conflict.push("column");
      if (!validReg) conflict.push("region");

      return res.json({ valid: false, conflict });
    });
    
  app.route('/api/solve')
    .post((req, res) => {
      const { puzzle } = req.body;

      // Required field
      if (puzzle === undefined) {
        return res.json({ error: "Required field missing" });
      }

      // Length check
      if (puzzle.length !== 81) {
        return res.json({ error: "Expected puzzle to be 81 characters long" });
      }

      // Character check
      if (/[^1-9.]/.test(puzzle)) {
        return res.json({ error: "Invalid characters in puzzle" });
      }

      // Solve
      let puzzleArr = [...puzzle];
      if (!solver.solve(puzzleArr)) {
        return res.json({ error: "Puzzle cannot be solved" });
      }

      return res.json({ solution: puzzleArr.join("") });
    });
};
