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
        this.currentStep = 0;
        this.selectedImage = null;
        
        this.imageCategories = {
            nature: [
                'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=100',
                'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=100',
                'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=100',
                'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=100'
            ],
            city: [
                'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=100',
                'https://images.unsplash.com/photo-1651408451633-ff492f347ec1?q=100&w=800&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                'https://images.unsplash.com/photo-1514565131-fce0801e5785?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=100',
                'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=100'
            ],
            abstract: [
                'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=100',
                'https://images.unsplash.com/photo-1557672172-298e090bd0f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=100',
                'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=100',
                'https://images.unsplash.com/photo-1541701494587-cb58502866ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=100'
            ],
            animals: [
                'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=100',
                'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=100',
                'https://images.unsplash.com/photo-1546026423-cc4642628d2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=100',
                'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=100'
            ],
            space: [
                'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=100',
                'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=100',
                'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=100',
                'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=100'
            ]
        };
        
        this.bestScores = this.loadBestScores();
        this.initializeEventListeners();
        this.loadImageCategory('nature');
    }
    
    initializeEventListeners() {
        // Grid selection
        document.querySelectorAll('.grid-option').forEach(option => {
            option.addEventListener('click', () => this.selectGrid(option));
        });
        
        // Image category selection
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => this.selectCategory(btn));
        });
        
        // Game controls
        document.getElementById('resetGame').addEventListener('click', () => this.resetToSetup());
        document.getElementById('hintBtn').addEventListener('click', () => this.showHint());
        document.getElementById('playAgain').addEventListener('click', () => this.startGame());
        document.getElementById('newSetup').addEventListener('click', () => this.resetToSetup());

        // Image upload
        document.getElementById('imageUploadInput').addEventListener('change', (e) => this.uploadImage(e));
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Touch support
        this.addTouchSupport();
    }
    
    selectGrid(option) {
        document.querySelectorAll('.grid-option').forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        this.gridSize = parseInt(option.dataset.size);
    }
    
    selectCategory(btn) {
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadImageCategory(btn.dataset.category);
    }
    
    loadImageCategory(category) {
        const imageGrid = document.getElementById('imageGrid');
        imageGrid.innerHTML = '';
        
        this.imageCategories[category].forEach((imageUrl, index) => {
            const imageOption = document.createElement('div');
            imageOption.className = 'image-option';
            imageOption.innerHTML = `
                <img src="${imageUrl}" alt="Image ${index + 1}" loading="lazy">
                <div class="image-overlay">
                    <i class="fas fa-check"></i>
                </div>
            `;
            
            imageOption.addEventListener('click', () => this.selectImage(imageOption, imageUrl));
            imageGrid.appendChild(imageOption);
        });
    }
    
    selectImage(option, imageUrl) {
        document.querySelectorAll('.image-option').forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        this.selectedImage = imageUrl;
        document.getElementById('imageNextBtn').disabled = false;
    }
    
    uploadImage() {
        const fileInput = document.getElementById('imageUploadInput');
        const file = fileInput.files[0];

        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                // Clear other selections
                document.querySelectorAll('.image-option').forEach(opt => opt.classList.remove('selected'));
                this.selectedImage = e.target.result;
                document.getElementById('imageNextBtn').disabled = false;

                // Show preview
                this.showUploadPreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    }
    
    showUploadPreview(imageSrc) {
        const previewContainer = document.querySelector('.upload-preview');
        const previewImg = previewContainer.querySelector('img');
        
        if (!previewContainer) {
            // Create preview container if it doesn't exist
            const container = document.createElement('div');
            container.className = 'upload-preview';
            container.innerHTML = `
                <img src="" alt="Upload Preview">
                <p>✓ Image uploaded successfully</p>
            `;
            document.querySelector('.custom-image-section').appendChild(container);
        }
        
        const preview = document.querySelector('.upload-preview');
        const img = preview.querySelector('img');
        img.src = imageSrc;
        preview.classList.add('show');
    }
    
    handleKeyPress(e) {
        if (!this.gameActive) return;
        
        const { row, col } = this.emptyPosition;
        let targetRow = row, targetCol = col;
        
        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                targetRow = row + 1;
                break;
            case 'ArrowDown':
                e.preventDefault();
                targetRow = row - 1;
                break;
            case 'ArrowLeft':
                e.preventDefault();
                targetCol = col + 1;
                break;
            case 'ArrowRight':
                e.preventDefault();
                targetCol = col - 1;
                break;
            default:
                return;
        }
        
        if (this.isValidPosition(targetRow, targetCol)) {
            this.movePiece(targetRow, targetCol);
        }
    }
    
    addTouchSupport() {
        let touchStartX, touchStartY;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchend', (e) => {
            if (!touchStartX || !touchStartY || !this.gameActive) return;
            
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (Math.abs(deltaX) > 50) {
                    this.handleSwipe(deltaX > 0 ? 'right' : 'left');
                }
            } else {
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
    
    createGameBoard() {
        const gameBoard = document.getElementById('gameBoard');
        const boardSize = Math.min(500, window.innerWidth - 40);
        
        gameBoard.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
        gameBoard.style.width = `${boardSize}px`;
        gameBoard.style.height = `${boardSize}px`;
        gameBoard.innerHTML = '';
        
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const piece = document.createElement('div');
                piece.className = 'puzzle-piece';
                piece.dataset.row = row;
                piece.dataset.col = col;
                
                piece.addEventListener('click', () => this.handlePieceClick(row, col));
                gameBoard.appendChild(piece);
            }
        }
    }
    
    startGame() {
        this.moves = 0;
        this.hintsUsed = 0;
        this.gameActive = true;
        this.startTime = Date.now();
        
        // Show game board and hide modal
        document.getElementById('gameBoard').style.display = 'grid';
        document.getElementById('successModal').style.display = 'none';
        
        this.createGameBoard();
        this.updateMoveCounter();
        this.startTimer();
        this.initializePuzzle();
        this.updateBestScoreDisplay();
        this.updatePreviewImage();
        
        document.querySelectorAll('.puzzle-piece').forEach(piece => {
            piece.classList.remove('hint', 'moveable');
        });
    }
    
    resetToSetup() {
        this.gameActive = false;
        this.stopTimer();
        document.getElementById('successModal').style.display = 'none';
        
        // Reset to introduction step
        document.querySelectorAll('.game-step').forEach(step => step.classList.remove('active'));
        document.getElementById('introStep').classList.add('active');
        
        // Hide game board
        document.getElementById('gameBoard').style.display = 'none';
        
        // Reset selections
        this.selectedImage = null;
        document.getElementById('imageNextBtn').disabled = true;
        document.querySelectorAll('.image-option').forEach(opt => opt.classList.remove('selected'));
        document.getElementById('imageUploadInput').value = '';
    }
    
    updatePreviewImage() {
        if (this.selectedImage) {
            document.getElementById('previewImg').src = this.selectedImage;
        }
    }
    
    initializePuzzle() {
        this.pieces = [];
        for (let row = 0; row < this.gridSize; row++) {
            this.pieces[row] = [];
            for (let col = 0; col < this.gridSize; col++) {
                this.pieces[row][col] = row * this.gridSize + col;
            }
        }
        
        this.emptyPosition = { row: this.gridSize - 1, col: this.gridSize - 1 };
        this.pieces[this.emptyPosition.row][this.emptyPosition.col] = null;
        
        this.shufflePuzzle();
        this.renderPuzzle();
    }
    
    shufflePuzzle() {
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
            { row: row - 1, col: col },
            { row: row + 1, col: col },
            { row: row, col: col - 1 },
            { row: row, col: col + 1 }
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
                
                piece.style.backgroundImage = `url(${this.selectedImage})`;
                piece.style.backgroundSize = `${this.gridSize * 100}% ${this.gridSize * 100}%`;
                piece.style.backgroundPosition = `${(pieceCol * 100) / (this.gridSize - 1)}% ${(pieceRow * 100) / (this.gridSize - 1)}%`;
                
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
            const piece = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
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
        const timeBonus = this.getElapsedTime() < 300 ? 1 : 0;
        
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
    
    showHint() {
        if (!this.gameActive) return;
        
        document.querySelectorAll('.puzzle-piece').forEach(piece => {
            piece.classList.remove('hint');
        });
        
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

// Global functions for step navigation
function nextStep() {
    const steps = ['introStep', 'gridStep', 'imageStep', 'gameStep'];
    const currentStep = document.querySelector('.game-step.active');
    const currentIndex = steps.indexOf(currentStep.id);
    
    if (currentIndex < steps.length - 1) {
        currentStep.classList.remove('active');
        const nextStepElement = document.getElementById(steps[currentIndex + 1]);
        nextStepElement.classList.add('active');
        
        // If moving to game step, start the game
        if (steps[currentIndex + 1] === 'gameStep') {
            window.puzzleGame.startGame();
        }
    }
}

function previousStep() {
    const steps = ['introStep', 'gridStep', 'imageStep', 'gameStep'];
    const currentStep = document.querySelector('.game-step.active');
    const currentIndex = steps.indexOf(currentStep.id);
    
    if (currentIndex > 0) {
        currentStep.classList.remove('active');
        document.getElementById(steps[currentIndex - 1]).classList.add('active');
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.puzzleGame = new EnhancedPuzzleGame();
});

// Handle window resize
window.addEventListener('resize', () => {
    if (window.puzzleGame && window.puzzleGame.gameActive) {
        window.puzzleGame.createGameBoard();
        window.puzzleGame.renderPuzzle();
    }
});