class EnhancedPuzzleGame {
    constructor() {
        this.gridSize = 4;
        this.pieces = [];
        this.emptyPosition = { row: 0, col: 0 };
        this.moves = 0;
        this.startTime = null;
        this.timerInterval = null;
        this.gameActive = false;
        this.hintsUsed = 0;
        
        this.images = {
            nature: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            city: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            abstract: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
        };
        
        this.currentImage = this.images.nature;
        this.bestScores = this.loadBestScores();
        
        this.initializeEventListeners();
        this.initializeGame();
    }
    
    initializeEventListeners() {
        document.getElementById('newGame').addEventListener('click', () => this.startNewGame());
        document.getElementById('hintBtn').addEventListener('click', () => this.showHint());
        document.getElementById('difficulty').addEventListener('change', (e) => {
            this.gridSize = parseInt(e.target.value);
            this.startNewGame();
        });
        document.getElementById('imageSelect').addEventListener('change', (e) => this.handleImageChange(e));
        document.getElementById('playAgain').addEventListener('click', () => this.closeModalAndRestart());
        document.getElementById('nextLevel').addEventListener('click', () => this.nextLevel());
        document.getElementById('confirmCustomImage').addEventListener('click', () => this.confirmCustomImage());
        document.getElementById('cancelCustomImage').addEventListener('click', () => this.closeCustomImageModal());
        
        // Touch support for mobile
        this.addTouchSupport();
    }
    
    addTouchSupport() {
        let touchStartX, touchStartY;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchend', (e) => {
            if (!touchStartX || !touchStartY) return;
            
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal swipe
                if (Math.abs(deltaX) > 50) {
                    this.handleSwipe(deltaX > 0 ? 'right' : 'left');
                }
            } else {
                // Vertical swipe
                if (Math.abs(deltaY) > 50) {
                    this.handleSwipe(deltaY > 0 ? 'down' : 'up');
                }
            }
            
            touchStartX = null;
            touchStartY = null;
        });
    }
    
    handleSwipe(direction) {
        const { row, col } = this.emptyPosition;
        let targetRow = row, targetCol = col;
        
        switch (direction) {
            case 'up': targetRow = row + 1; break;
            case 'down': targetRow = row - 1; break;
            case 'left': targetCol = col + 1; break;
            case 'right': targetCol = col - 1; break;
        }
        
        if (this.isValidPosition(targetRow, targetCol)) {
            this.movePiece(targetRow, targetCol);
        }
    }
    
    handleImageChange(e) {
        const value = e.target.value;
        if (value === 'custom') {
            this.showCustomImageModal();
        } else {
            this.currentImage = this.images[value];
            this.updatePreviewImage();
            this.startNewGame();
        }
    }
    
    showCustomImageModal() {
        document.getElementById('customImageModal').style.display = 'block';
        document.getElementById('customImageUrl').focus();
    }
    
    closeCustomImageModal() {
        document.getElementById('customImageModal').style.display = 'none';
        document.getElementById('imageSelect').value = 'nature';
    }
    
    confirmCustomImage() {
        const url = document.getElementById('customImageUrl').value.trim();
        if (url) {
            this.currentImage = url;
            this.updatePreviewImage();
            this.closeCustomImageModal();
            this.startNewGame();
        }
    }
    
    updatePreviewImage() {
        document.getElementById('previewImg').src = this.currentImage;
    }
    
    initializeGame() {
        this.createGameBoard();
        this.updatePreviewImage();
        this.startNewGame();
    }
    
    createGameBoard() {
        const gameBoard = document.getElementById('gameBoard');
        const boardSize = Math.min(500, window.innerWidth - 40);
        const pieceSize = (boardSize - 20) / this.gridSize;
        
        gameBoard.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
        gameBoard.style.width = `${boardSize}px`;
        gameBoard.style.height = `${boardSize}px`;
        
        gameBoard.innerHTML = '';
        
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const piece = document.createElement('div');
                piece.className = 'puzzle-piece';
                piece.style.width = `${pieceSize}px`;
                piece.style.height = `${pieceSize}px`;
                piece.dataset.row = row;
                piece.dataset.col = col;
                
                piece.addEventListener('click', () => this.handlePieceClick(row, col));
                
                gameBoard.appendChild(piece);
            }
        }
    }
    
    startNewGame() {
        this.moves = 0;
        this.hintsUsed = 0;
        this.gameActive = true;
        this.startTime = Date.now();
        
        this.updateMoveCounter();
        this.startTimer();
        this.initializePuzzle();
        this.updateBestScoreDisplay();
        
        // Clear any existing hints
        document.querySelectorAll('.puzzle-piece').forEach(piece => {
            piece.classList.remove('hint', 'moveable');
        });
    }
    
    initializePuzzle() {
        // Create solved state
        this.pieces = [];
        for (let row = 0; row < this.gridSize; row++) {
            this.pieces[row] = [];
            for (let col = 0; col < this.gridSize; col++) {
                this.pieces[row][col] = row * this.gridSize + col;
            }
        }
        
        // Set empty position (bottom-right)
        this.emptyPosition = { row: this.gridSize - 1, col: this.gridSize - 1 };
        this.pieces[this.emptyPosition.row][this.emptyPosition.col] = null;
        
        // Shuffle the puzzle
        this.shufflePuzzle();
        this.renderPuzzle();
    }
    
    shufflePuzzle() {
        // Perform random valid moves to ensure solvability
        const moves = this.gridSize * this.gridSize * 100;
        
        for (let i = 0; i < moves; i++) {
            const validMoves = this.getValidMoves();
            if (validMoves.length > 0) {
                const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
                this.swapPieces(randomMove.row, randomMove.col, this.emptyPosition.row, this.emptyPosition.col);
                this.emptyPosition = { row: randomMove.row, col: randomMove.col };
            }
        }
    }
    
    getValidMoves() {
        const moves = [];
        const { row, col } = this.emptyPosition;
        
        const directions = [
            { row: row - 1, col: col }, // up
            { row: row + 1, col: col }, // down
            { row: row, col: col - 1 }, // left
            { row: row, col: col + 1 }  // right
        ];
        
        directions.forEach(pos => {
            if (this.isValidPosition(pos.row, pos.col)) {
                moves.push(pos);
            }
        });
        
        return moves;
    }
    
    isValidPosition(row, col) {
        return row >= 0 && row < this.gridSize && col >= 0 && col < this.gridSize;
    }
    
    renderPuzzle() {
        const pieces = document.querySelectorAll('.puzzle-piece');
        
        pieces.forEach((piece, index) => {
            const row = Math.floor(index / this.gridSize);
            const col = index % this.gridSize;
            const pieceValue = this.pieces[row][col];
            
            piece.classList.remove('empty', 'moveable');
            
            if (pieceValue === null) {
                piece.classList.add('empty');
                piece.style.backgroundImage = '';
            } else {
                const pieceRow = Math.floor(pieceValue / this.gridSize);
                const pieceCol = pieceValue % this.gridSize;
                
                piece.style.backgroundImage = `url(${this.currentImage})`;
                piece.style.backgroundPosition = 
                    `-${pieceCol * (100 / (this.gridSize - 1))}% -${pieceRow * (100 / (this.gridSize - 1))}%`;
                piece.style.backgroundSize = `${this.gridSize * 100}% ${this.gridSize * 100}%`;
                
                // Highlight moveable pieces
                if (this.canMovePiece(row, col)) {
                    piece.classList.add('moveable');
                }
            }
        });
    }
    
    handlePieceClick(row, col) {
        if (!this.gameActive) return;
        
        if (this.canMovePiece(row, col)) {
            this.movePiece(row, col);
        } else {
            // Visual feedback for invalid move
            const piece = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            piece.style.animation = 'none';
            piece.offsetHeight; // Trigger reflow
            piece.style.animation = 'shake 0.5s ease-in-out';
            
            setTimeout(() => {
                piece.style.animation = '';
            }, 500);
        }
    }
    
    canMovePiece(row, col) {
        const { row: emptyRow, col: emptyCol } = this.emptyPosition;
        return (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
               (Math.abs(col - emptyCol) === 1 && row === emptyRow);
    }
    
    movePiece(row, col) {
        this.swapPieces(row, col, this.emptyPosition.row, this.emptyPosition.col);
        this.emptyPosition = { row, col };
        this.moves++;
        
        this.updateMoveCounter();
        this.renderPuzzle();
        
        // Add move animation
        const piece = document.querySelector(`[data-row="${this.emptyPosition.row}"][data-col="${this.emptyPosition.col}"]`);
        piece.style.animation = 'none';
        piece.offsetHeight;
        piece.style.animation = 'fadeIn 0.3s ease';
        
        if (this.isPuzzleSolved()) {
            this.handleGameComplete();
        }
    }
    
    swapPieces(row1, col1, row2, col2) {
        const temp = this.pieces[row1][col1];
        this.pieces[row1][col1] = this.pieces[row2][col2];
        this.pieces[row2][col2] = temp;
    }
    
    isPuzzleSolved() {
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const expectedValue = row * this.gridSize + col;
                if (row === this.gridSize - 1 && col === this.gridSize - 1) {
                    // Last position should be empty
                    if (this.pieces[row][col] !== null) return false;
                } else {
                    if (this.pieces[row][col] !== expectedValue) return false;
                }
            }
        }
        return true;
    }
    
    handleGameComplete() {
        this.gameActive = false;
        this.stopTimer();
        
        const finalTime = this.getElapsedTime();
        const rating = this.calculateRating();
        
        // Update best score
        const scoreKey = `best_${this.gridSize}x${this.gridSize}`;
        const currentBest = this.bestScores[scoreKey];
        if (!currentBest || this.moves < currentBest.moves || 
            (this.moves === currentBest.moves && finalTime < currentBest.time)) {
            this.bestScores[scoreKey] = { moves: this.moves, time: finalTime };
            this.saveBestScores();
        }
        
        this.showSuccessModal(finalTime, rating);
    }
    
    calculateRating() {
        const optimalMoves = this.gridSize * this.gridSize * 2;
        const timeBonus = this.getElapsedTime() < 300 ? 1 : 0; // 5 minutes
        
        if (this.moves <= optimalMoves && timeBonus) {
            return { text: 'Perfect!', class: 'perfect', stars: 3 };
        } else if (this.moves <= optimalMoves * 1.5) {
            return { text: 'Excellent!', class: 'excellent', stars: 3 };
        } else if (this.moves <= optimalMoves * 2) {
            return { text: 'Great!', class: 'great', stars: 2 };
        } else {
            return { text: 'Good!', class: 'good', stars: 1 };
        }
    }
    
    showSuccessModal(finalTime, rating) {
        document.getElementById('finalTime').textContent = this.formatTime(finalTime);
        document.getElementById('finalMoves').textContent = this.moves;
        document.getElementById('finalRating').textContent = rating.text;
        document.getElementById('finalRating').className = `stat-value ${rating.class}`;
        
        document.getElementById('successModal').style.display = 'block';
    }
    
    closeModalAndRestart() {
        document.getElementById('successModal').style.display = 'none';
        this.startNewGame();
    }
    
    nextLevel() {
        document.getElementById('successModal').style.display = 'none';
        if (this.gridSize < 5) {
            this.gridSize++;
            document.getElementById('difficulty').value = this.gridSize;
            this.createGameBoard();
            this.startNewGame();
        } else {
            this.startNewGame();
        }
    }
    
    showHint() {
        if (!this.gameActive) return;
        
        // Clear previous hints
        document.querySelectorAll('.puzzle-piece').forEach(piece => {
            piece.classList.remove('hint');
        });
        
        // Find a piece that can move and is in wrong position
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const pieceValue = this.pieces[row][col];
                if (pieceValue !== null) {
                    const correctRow = Math.floor(pieceValue / this.gridSize);
                    const correctCol = pieceValue % this.gridSize;
                    
                    if ((row !== correctRow || col !== correctCol) && this.canMovePiece(row, col)) {
                        const piece = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                        piece.classList.add('hint');
                        this.hintsUsed++;
                        return;
                    }
                }
            }
        }
    }
    
    startTimer() {
        this.stopTimer();
        this.timerInterval = setInterval(() => {
            const elapsed = this.getElapsedTime();
            document.getElementById('timer').textContent = this.formatTime(elapsed);
        }, 1000);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    getElapsedTime() {
        return this.startTime ? Math.floor((Date.now() - this.startTime) / 1000) : 0;
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    updateMoveCounter() {
        document.getElementById('moveCounter').textContent = this.moves;
    }
    
    updateBestScoreDisplay() {
        const scoreKey = `best_${this.gridSize}x${this.gridSize}`;
        const bestScore = this.bestScores[scoreKey];
        document.getElementById('bestScore').textContent = 
            bestScore ? `${bestScore.moves} moves` : '--';
    }
    
    loadBestScores() {
        try {
            return JSON.parse(localStorage.getItem('puzzleBestScores')) || {};
        } catch {
            return {};
        }
    }
    
    saveBestScores() {
        try {
            localStorage.setItem('puzzleBestScores', JSON.stringify(this.bestScores));
            this.updateBestScoreDisplay();
        } catch (e) {
            console.warn('Could not save best scores:', e);
        }
    }
}

// Add shake animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EnhancedPuzzleGame();
});

// Handle window resize
window.addEventListener('resize', () => {
    // Recreate board with new dimensions
    if (window.puzzleGame) {
        window.puzzleGame.createGameBoard();
        window.puzzleGame.renderPuzzle();
    }
});