// Chess game implementation
document.addEventListener('DOMContentLoaded', function() {
    // Chess board representation and game state
    const EMPTY = 0;
    const PAWN = 1;
    const KNIGHT = 2;
    const BISHOP = 3;
    const ROOK = 4;
    const QUEEN = 5;
    const KING = 6;
    
    const WHITE = 0;
    const BLACK = 1;
    
    // Game state variables
    let board = [];
    let currentPlayer = WHITE;
    let selectedPiece = null;
    let gameOver = false;
    let moveHistory = [];
    
    // DOM elements
    const chessboardElement = document.getElementById('chessboard');
    const statusElement = document.getElementById('status');
    const newGameBtn = document.getElementById('newGameBtn');
    const undoBtn = document.getElementById('undoBtn');
    
    // Initialize the game
    initGame();
    
    // Event listeners
    newGameBtn.addEventListener('click', initGame);
    undoBtn.addEventListener('click', undoMove);
    
    function initGame() {
        // Initialize empty board
        board = Array(8).fill().map(() => Array(8).fill(0));
        
        // Set up pieces
        setupInitialPosition();
        
        // Reset game state
        currentPlayer = WHITE;
        selectedPiece = null;
        gameOver = false;
        moveHistory = [];
        
        // Render the board
        renderBoard();
        
        // Update status
        updateStatus();
    }
    
    function setupInitialPosition() {
        // Set up pawns
        for (let i = 0; i < 8; i++) {
            board[1][i] = { type: PAWN, color: BLACK };
            board[6][i] = { type: PAWN, color: WHITE };
        }
        
        // Set up other pieces
        const backRankPieces = [ROOK, KNIGHT, BISHOP, QUEEN, KING, BISHOP, KNIGHT, ROOK];
        
        for (let i = 0; i < 8; i++) {
            board[0][i] = { type: backRankPieces[i], color: BLACK };
            board[7][i] = { type: backRankPieces[i], color: WHITE };
        }
    }
    
    function renderBoard() {
        // Clear the chessboard
        chessboardElement.innerHTML = '';
        
        // Create the chess board grid
        const boardGrid = document.createElement('div');
        boardGrid.style.display = 'grid';
        boardGrid.style.gridTemplateColumns = 'repeat(8, 1fr)';
        boardGrid.style.gridTemplateRows = 'repeat(8, 1fr)';
        boardGrid.style.height = '100%';
        boardGrid.style.width = '100%';
        
        // Add squares and pieces
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.classList.add('square');
                square.dataset.row = row;
                square.dataset.col = col;
                
                // Set square color
                const isLightSquare = (row + col) % 2 === 0;
                square.style.backgroundColor = isLightSquare ? '#f0d9b5' : '#b58863';
                
                // Add piece if present
                const piece = board[row][col];
                if (piece !== 0) {
                    const pieceElement = document.createElement('div');
                    pieceElement.classList.add('piece');
                    pieceElement.textContent = getPieceSymbol(piece.type, piece.color);
                    pieceElement.style.fontSize = '2.5rem';
                    pieceElement.style.textAlign = 'center';
                    pieceElement.style.cursor = 'pointer';
                    
                    square.appendChild(pieceElement);
                }
                
                // Add click event for game play
                square.addEventListener('click', () => handleSquareClick(row, col));
                
                // Add to the board
                boardGrid.appendChild(square);
            }
        }
        
        chessboardElement.appendChild(boardGrid);
    }
    
    function getPieceSymbol(type, color) {
        const symbols = {
            [WHITE]: {
                [PAWN]: '♙',
                [KNIGHT]: '♘',
                [BISHOP]: '♗',
                [ROOK]: '♖',
                [QUEEN]: '♕',
                [KING]: '♔'
            },
            [BLACK]: {
                [PAWN]: '♟',
                [KNIGHT]: '♞',
                [BISHOP]: '♝',
                [ROOK]: '♜',
                [QUEEN]: '♛',
                [KING]: '♚'
            }
        };
        
        return symbols[color][type];
    }
    
    function handleSquareClick(row, col) {
        if (gameOver) return;
        
        const piece = board[row][col];
        
        // If no piece is selected and the clicked square has a piece of the current player's color
        if (selectedPiece === null && piece !== 0 && piece.color === currentPlayer) {
            selectedPiece = { row, col };
            highlightSquare(row, col);
            return;
        }
        
        // If a piece is already selected
        if (selectedPiece !== null) {
            // If clicking on the same piece, deselect it
            if (selectedPiece.row === row && selectedPiece.col === col) {
                selectedPiece = null;
                renderBoard(); // Remove highlight
                return;
            }
            
            // If clicking on another piece of the same color, select that piece instead
            if (piece !== 0 && piece.color === currentPlayer) {
                selectedPiece = { row, col };
                renderBoard();
                highlightSquare(row, col);
                return;
            }
            
            // Attempt to move the selected piece
            const fromRow = selectedPiece.row;
            const fromCol = selectedPiece.col;
            
            if (isValidMove(fromRow, fromCol, row, col)) {
                // Save move for undo
                moveHistory.push({
                    fromRow,
                    fromCol,
                    toRow: row,
                    toCol: col,
                    capturedPiece: board[row][col],
                    piece: board[fromRow][fromCol]
                });
                
                // Move the piece
                board[row][col] = board[fromRow][fromCol];
                board[fromRow][fromCol] = 0;
                
                // Check for pawn promotion
                if (board[row][col].type === PAWN && (row === 0 || row === 7)) {
                    board[row][col] = { type: QUEEN, color: currentPlayer };
                }
                
                // Switch player
                currentPlayer = currentPlayer === WHITE ? BLACK : WHITE;
                
                // Reset selection
                selectedPiece = null;
                
                // Update the board
                renderBoard();
                
                // Update status
                updateStatus();
                
                // If playing against computer, make computer move
                if (currentPlayer === BLACK && !gameOver) {
                    setTimeout(makeComputerMove, 500);
                }
            }
        }
    }
    
    function highlightSquare(row, col) {
        const square = document.querySelector(`.square[data-row="${row}"][data-col="${col}"]`);
        if (square) {
            square.style.backgroundColor = '#aaf7aa';
        }
    }
    
    function isValidMove(fromRow, fromCol, toRow, toCol) {
        const piece = board[fromRow][fromCol];
        const targetSquare = board[toRow][toCol];
        
        // Can't capture own pieces
        if (targetSquare !== 0 && targetSquare.color === piece.color) {
            return false;
        }
        
        // Simple movement validation based on piece type
        switch (piece.type) {
            case PAWN:
                return isValidPawnMove(fromRow, fromCol, toRow, toCol, piece.color);
            case KNIGHT:
                return isValidKnightMove(fromRow, fromCol, toRow, toCol);
            case BISHOP:
                return isValidBishopMove(fromRow, fromCol, toRow, toCol);
            case ROOK:
                return isValidRookMove(fromRow, fromCol, toRow, toCol);
            case QUEEN:
                return isValidQueenMove(fromRow, fromCol, toRow, toCol);
            case KING:
                return isValidKingMove(fromRow, fromCol, toRow, toCol);
            default:
                return false;
        }
    }
    
    function isValidPawnMove(fromRow, fromCol, toRow, toCol, color) {
        const direction = color === WHITE ? -1 : 1;
        const startRow = color === WHITE ? 6 : 1;
        
        // Forward movement (no capture)
        if (fromCol === toCol) {
            // Single square forward
            if (toRow === fromRow + direction && board[toRow][toCol] === 0) {
                return true;
            }
            
            // Double square forward from starting position
            if (fromRow === startRow && 
                toRow === fromRow + 2 * direction && 
                board[fromRow + direction][toCol] === 0 && 
                board[toRow][toCol] === 0) {
                return true;
            }
        }
        
        // Diagonal capture
        if (toRow === fromRow + direction && 
            Math.abs(toCol - fromCol) === 1 && 
            board[toRow][toCol] !== 0 && 
            board[toRow][toCol].color !== color) {
            return true;
        }
        
        return false;
    }
    
    function isValidKnightMove(fromRow, fromCol, toRow, toCol) {
        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);
        
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
    }
    
    function isValidBishopMove(fromRow, fromCol, toRow, toCol) {
        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);
        
        // Must move diagonally
        if (rowDiff !== colDiff) {
            return false;
        }
        
        // Check if path is clear
        const rowStep = toRow > fromRow ? 1 : -1;
        const colStep = toCol > fromCol ? 1 : -1;
        
        for (let i = 1; i < rowDiff; i++) {
            if (board[fromRow + i * rowStep][fromCol + i * colStep] !== 0) {
                return false;
            }
        }
        
        return true;
    }
    
    function isValidRookMove(fromRow, fromCol, toRow, toCol) {
        // Must move horizontally or vertically
        if (fromRow !== toRow && fromCol !== toCol) {
            return false;
        }
        
        // Check if path is clear
        if (fromRow === toRow) {
            // Horizontal move
            const step = toCol > fromCol ? 1 : -1;
            for (let col = fromCol + step; col !== toCol; col += step) {
                if (board[fromRow][col] !== 0) {
                    return false;
                }
            }
        } else {
            // Vertical move
            const step = toRow > fromRow ? 1 : -1;
            for (let row = fromRow + step; row !== toRow; row += step) {
                if (board[row][fromCol] !== 0) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    function isValidQueenMove(fromRow, fromCol, toRow, toCol) {
        return isValidRookMove(fromRow, fromCol, toRow, toCol) || 
               isValidBishopMove(fromRow, fromCol, toRow, toCol);
    }
    
    function isValidKingMove(fromRow, fromCol, toRow, toCol) {
        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);
        
        // King can move one square in any direction
        return rowDiff <= 1 && colDiff <= 1;
    }
    
    function updateStatus() {
        if (isCheckmate()) {
            const winner = currentPlayer === WHITE ? 'Black' : 'White';
            statusElement.textContent = `Checkmate! ${winner} wins!`;
            gameOver = true;
        } else if (isStalemate()) {
            statusElement.textContent = 'Stalemate! The game is a draw.';
            gameOver = true;
        } else {
            const playerTurn = currentPlayer === WHITE ? 'White' : 'Black';
            statusElement.textContent = `${playerTurn} to move`;
        }
    }
    
    function isCheckmate() {
        // Simplified implementation - just for demonstration
        return false;
    }
    
    function isStalemate() {
        // Simplified implementation - just for demonstration
        return false;
    }
    
    function undoMove() {
        if (moveHistory.length === 0) return;
        
        const lastMove = moveHistory.pop();
        
        // Restore the piece to its original position
        board[lastMove.fromRow][lastMove.fromCol] = lastMove.piece;
        board[lastMove.toRow][lastMove.toCol] = lastMove.capturedPiece;
        
        // Switch back to previous player
        currentPlayer = currentPlayer === WHITE ? BLACK : WHITE;
        
        // Reset selection
        selectedPiece = null;
        
        // Update the board
        renderBoard();
        
        // Update status
        updateStatus();
    }
    
    function makeComputerMove() {
        // Find all possible moves for black pieces
        const possibleMoves = [];
        
        for (let fromRow = 0; fromRow < 8; fromRow++) {
            for (let fromCol = 0; fromCol < 8; fromCol++) {
                const piece = board[fromRow][fromCol];
                
                if (piece !== 0 && piece.color === BLACK) {
                    for (let toRow = 0; toRow < 8; toRow++) {
                        for (let toCol = 0; toCol < 8; toCol++) {
                            if (isValidMove(fromRow, fromCol, toRow, toCol)) {
                                possibleMoves.push({
                                    fromRow,
                                    fromCol,
                                    toRow,
                                    toCol,
                                    piece,
                                    capturedPiece: board[toRow][toCol]
                                });
                            }
                        }
                    }
                }
            }
        }
        
        // If there are possible moves, make a random one
        if (possibleMoves.length > 0) {
            const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            
            // Save move for undo
            moveHistory.push(randomMove);
            
            // Make the move
            board[randomMove.toRow][randomMove.toCol] = board[randomMove.fromRow][randomMove.fromCol];
            board[randomMove.fromRow][randomMove.fromCol] = 0;
            
            // Check for pawn promotion
            if (board[randomMove.toRow][randomMove.toCol].type === PAWN && randomMove.toRow === 7) {
                board[randomMove.toRow][randomMove.toCol] = { type: QUEEN, color: BLACK };
            }
            
            // Switch player
            currentPlayer = WHITE;
            
            // Update the board
            renderBoard();
            
            // Update status
            updateStatus();
        }
    }
});
