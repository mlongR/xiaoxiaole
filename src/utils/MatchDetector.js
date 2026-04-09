export default class MatchDetector {
  constructor(boardSize) {
    this.boardSize = boardSize;
  }

  /**
   * 检测所有匹配
   * @param {Array} grid - 二维数组，存储汉字
   * @returns {Array} 匹配的位置列表 [{row, col, char, direction}]
   */
  findAllMatches(grid) {
    const matches = [];
    const visited = new Set();

    // 横向检测
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize - 2; col++) {
        const char = grid[row][col];
        if (!char) continue;

        if (grid[row][col + 1] === char && grid[row][col + 2] === char) {
          // 找到连续相同的，继续检查是否有更长的
          let endCol = col + 2;
          while (endCol + 1 < this.boardSize && grid[row][endCol + 1] === char) {
            endCol++;
          }

          // 记录所有匹配的位置
          for (let c = col; c <= endCol; c++) {
            const key = `${row},${c}`;
            if (!visited.has(key)) {
              matches.push({ row, col: c, char, direction: 'horizontal' });
              visited.add(key);
            }
          }
        }
      }
    }

    // 纵向检测
    for (let col = 0; col < this.boardSize; col++) {
      for (let row = 0; row < this.boardSize - 2; row++) {
        const char = grid[row][col];
        if (!char) continue;

        if (grid[row + 1][col] === char && grid[row + 2][col] === char) {
          let endRow = row + 2;
          while (endRow + 1 < this.boardSize && grid[endRow + 1][col] === char) {
            endRow++;
          }

          for (let r = row; r <= endRow; r++) {
            const key = `${r},${col}`;
            if (!visited.has(key)) {
              matches.push({ row: r, col, char, direction: 'vertical' });
              visited.add(key);
            }
          }
        }
      }
    }

    return matches;
  }

  /**
   * 检查交换后是否会产生匹配
   * @param {Array} grid - 棋盘数据
   * @param {Object} pos1 - 位置1 {row, col}
   * @param {Object} pos2 - 位置2 {row, col}
   * @returns {boolean} 是否会产生匹配
   */
  wouldMatchAfterSwap(grid, pos1, pos2) {
    // 临时交换
    const temp = grid[pos1.row][pos1.col];
    grid[pos1.row][pos1.col] = grid[pos2.row][pos2.col];
    grid[pos2.row][pos2.col] = temp;

    // 检查匹配
    const matches = this.findAllMatches(grid);

    // 换回来
    grid[pos2.row][pos2.col] = grid[pos1.row][pos1.col];
    grid[pos1.row][pos1.col] = temp;

    return matches.length > 0;
  }

  /**
   * 检查是否有可行的移动
   * @param {Array} grid - 棋盘数据
   * @returns {Object|null} 可行的移动 {from, to} 或 null
   */
  findPossibleMove(grid) {
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        // 检查与右边交换
        if (col < this.boardSize - 1) {
          if (this.wouldMatchAfterSwap(grid, { row, col }, { row, col: col + 1 })) {
            return { from: { row, col }, to: { row, col: col + 1 } };
          }
        }
        // 检查与下边交换
        if (row < this.boardSize - 1) {
          if (this.wouldMatchAfterSwap(grid, { row, col }, { row: row + 1, col })) {
            return { from: { row, col }, to: { row: row + 1, col } };
          }
        }
      }
    }
    return null;
  }

  /**
   * 按字符分组匹配
   * @param {Array} matches - 匹配列表
   * @returns {Object} 按字符分组的匹配 {char: count}
   */
  groupMatchesByChar(matches) {
    const groups = {};
    matches.forEach(match => {
      if (!groups[match.char]) {
        groups[match.char] = 0;
      }
      groups[match.char]++;
    });
    return groups;
  }

  /**
   * 将匹配分组为独立的匹配组（每组是一个连续的横向或纵向匹配）
   * @param {Array} matches - 匹配列表
   * @returns {Array} 匹配组列表，每组是一个 {char, positions: [{row, col}]} 对象
   */
  groupMatchesSequentially(matches) {
    if (matches.length === 0) return [];

    // 按方向分组
    const horizontal = matches.filter(m => m.direction === 'horizontal');
    const vertical = matches.filter(m => m.direction === 'vertical');

    const groups = [];

    // 处理横向匹配 - 按行分组，同一行的连续同字符为一组
    const horizontalByRow = {};
    horizontal.forEach(m => {
      const key = m.row;
      if (!horizontalByRow[key]) horizontalByRow[key] = [];
      horizontalByRow[key].push(m);
    });

    for (const row in horizontalByRow) {
      const rowMatches = horizontalByRow[row].sort((a, b) => a.col - b.col);
      let currentGroup = null;

      rowMatches.forEach(m => {
        if (!currentGroup || currentGroup.char !== m.char || m.col !== currentGroup.positions[currentGroup.positions.length - 1].col + 1) {
          // 新组
          if (currentGroup) groups.push(currentGroup);
          currentGroup = { char: m.char, positions: [{ row: m.row, col: m.col }] };
        } else {
          // 继续当前组
          currentGroup.positions.push({ row: m.row, col: m.col });
        }
      });
      if (currentGroup) groups.push(currentGroup);
    }

    // 处理纵向匹配 - 按列分组，同一列的连续同字符为一组
    const verticalByCol = {};
    vertical.forEach(m => {
      const key = m.col;
      if (!verticalByCol[key]) verticalByCol[key] = [];
      verticalByCol[key].push(m);
    });

    for (const col in verticalByCol) {
      const colMatches = verticalByCol[col].sort((a, b) => a.row - b.row);
      let currentGroup = null;

      colMatches.forEach(m => {
        if (!currentGroup || currentGroup.char !== m.char || m.row !== currentGroup.positions[currentGroup.positions.length - 1].row + 1) {
          // 新组
          if (currentGroup) groups.push(currentGroup);
          currentGroup = { char: m.char, positions: [{ row: m.row, col: m.col }] };
        } else {
          // 继续当前组
          currentGroup.positions.push({ row: m.row, col: m.col });
        }
      });
      if (currentGroup) groups.push(currentGroup);
    }

    return groups;
  }
}
