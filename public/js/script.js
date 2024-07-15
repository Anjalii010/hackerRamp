let timeLeft = 60; // 30 seconds for demo purposes
const timerElement = document.getElementById('time-left');
const votingTimerElement = document.getElementById('voting-timer-value'); // Ensure this element exists in your HTML
const joinBtn = document.getElementById('join-btn');
const modal = document.getElementById('join-modal');
const submitBtn = document.querySelector('#join-modal .submit-btn');
const fileInput = document.getElementById('file-input');
const descriptionInput = document.getElementById('description');

let contestTimerInterval; // Interval for contest timer
let votingTimerInterval; // Interval for voting timer

function updateTimer() {
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;
    
    timerElement.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    if (timeLeft > 0) {
        timeLeft--;
    } else {
        clearInterval(contestTimerInterval);
        showTimeOverMessage();
        startVotingTimer();
        disableJoinButton();
        document.getElementById('contest-timer').style.display = 'none';
    }
}

// Start the contest timer initially
contestTimerInterval = setInterval(updateTimer, 1000);
updateTimer();

function showTimeOverMessage() {
    document.getElementById('time-over-message').style.display = 'block';
}

function disableJoinButton() {
    joinBtn.disabled = true;
    joinBtn.style.display = 'none';
}

joinBtn.addEventListener('click', function(event) {
    event.preventDefault();
    modal.style.display = 'block';
});

const closeBtn = document.getElementById('close-btn');
closeBtn.addEventListener('click', function() {
    modal.style.display = 'none';
});

submitBtn.addEventListener('click', function(event) {
    event.preventDefault();

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('description', descriptionInput.value);

    fetch('/submit-contestant', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });

    modal.style.display = 'none';
});


function disableVotingAndCommenting() {
    const voteBtns = document.querySelectorAll('.vote-btn');
    const commentBtns = document.querySelectorAll('.comment-btn');

    voteBtns.forEach(btn => {
        btn.disabled = true;
        btn.innerHTML = 'Voting Closed';
    });

    commentBtns.forEach(btn => {
        btn.disabled = true;
        btn.innerHTML = 'Comments Closed';
    });

    // Fetch contestants and determine top three
    fetch('/contestants')
        .then(response => response.json())
        .then(data => {
            // Sort contestants by votes in descending order
            data.sort((a, b) => b.votes.length - a.votes.length);

            // Display top three contestants
            const topThree = data.slice(0, 3); // Get the first three contestants
            const topThreeContainer = document.getElementById('top-three-container');
            topThreeContainer.innerHTML = '<h2>CONGRATULATIONS!</h2><p>Top Three Contestants:</p>';
            topThree.forEach((contestant, index) => {
                const contestantElement = document.createElement('div');
                contestantElement.innerHTML = `<p>${index + 1}. ${contestant.description} - ${contestant.votes.length} votes</p>`;
                topThreeContainer.appendChild(contestantElement);
            });
        })
        .catch(error => {
            console.error('Error fetching contestants:', error);
        });
}
function displayTopVoters(topVoters) {
    const topVotersContainer = document.getElementById('top-voters-container');
    topVotersContainer.innerHTML = ''; // Clear existing content

    topVoters.forEach(voter => {
        const voterItem = document.createElement('div');
        voterItem.className = 'voter-item';
        voterItem.innerHTML = `
            <img src="${voter.photo}" alt="${voter.name}">
            <h3>${voter.name}</h3>
            <p>Votes: ${voter.votes}</p>
        `;
        topVotersContainer.appendChild(voterItem);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    fetchTopVoters();
});


function enableVotingAndCommenting() {
    const voteBtns = document.querySelectorAll('.vote-btn');
    const commentBtns = document.querySelectorAll('.comment-btn');
    let votingTimeLeft = 20; // 20 seconds for voting

    // Function to update voting timer and check timeout
    const updateVotingTimer = () => {
        if (votingTimeLeft <= 0) {
            clearInterval(votingTimerInterval);
            disableVotingAndCommenting(); // Disable buttons after timer ends
        }
        votingTimerElement.textContent = `${String(Math.floor(votingTimeLeft / 60)).padStart(2, '0')}:${String(votingTimeLeft % 60).padStart(2, '0')}`;
        votingTimeLeft--;
    };

    // Update voting timer initially
    votingTimerInterval = setInterval(updateVotingTimer, 1000);

    voteBtns.forEach(btn => {
        btn.addEventListener('click', async function() {
            const contestantId = this.closest('.photo-item').dataset.contestantId;
            const response = await fetch(`/vote/${contestantId}`, { method: 'POST' });
            if (response.ok) {
                const updatedContestant = await response.json();
                console.log(`Voted for contestant: ${JSON.stringify(updatedContestant)}`);
                // Update UI if needed
            } else {
                console.error('Failed to vote');
            }
        });
    });

    commentBtns.forEach(btn => {
        btn.addEventListener('click', async function() {
            const contestantId = this.closest('.photo-item').dataset.contestantId;
            const comment = prompt('Enter your comment:');
            if (comment) {
                const response = await fetch(`/comment/${contestantId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ comment })
                });
                if (response.ok) {
                    const updatedContestant = await response.json();
                    console.log(`Comment added for contestant: ${JSON.stringify(updatedContestant)}`);
                    // Update UI if needed
                } else {
                    console.error('Failed to add comment');
                }
            }
        });
    });
}

function fetchContestants() {
    let contestTimerFinished = false;
    let votingTimerFinished = false;

    // Function to check if both timers have finished
    const checkTimers = () => {
        if (contestTimerFinished && votingTimerFinished) {
            // Fetch contestants only after both timers finish
            fetch('/contestants')
                .then(response => response.json())
                .then(data => {
                    const contestantsContainer = document.getElementById('contestants-container');
                    contestantsContainer.innerHTML = '';
                    data.forEach(contestant => {
                        const photoItem = document.createElement('div');
                        photoItem.className = 'photo-item';
                        photoItem.dataset.contestantId = contestant._id; // Assuming contestant has _id field
                        photoItem.innerHTML = `<img src="/uploads/${contestant.photo}" alt="Contestant Photo"><p>${contestant.description}</p>`;
                        const actionsDiv = document.createElement('div');
                        actionsDiv.className = 'actions';
                        actionsDiv.innerHTML = `<button class="vote-btn">Vote</button><button class="comment-btn">Comment</button>`;
                        photoItem.appendChild(actionsDiv);
                        contestantsContainer.appendChild(photoItem);
                    });

                    // Enable voting and commenting
                    enableVotingAndCommenting();
                })
                .catch((error) => {
                    console.error('Error fetching contestants:', error);
                });
        }
    };

    // Contest timer
    let contestTimeLeft = 60; // 30 seconds for demo purposes
    const contestTimerInterval = setInterval(() => {
        if (contestTimeLeft <= 0) {
            clearInterval(contestTimerInterval);
            contestTimerFinished = true;
            checkTimers();
        }
        contestTimeLeft--;
    }, 1000);

    // Voting timer
    let votingTimeLeft = 20; // 10 seconds for demo purposes
    const votingTimerInterval = setInterval(() => {
        if (votingTimeLeft <= 0) {
            clearInterval(votingTimerInterval);
            votingTimerFinished = true;
            checkTimers();
        }
        votingTimerElement.textContent = `${String(Math.floor(votingTimeLeft / 60)).padStart(2, '0')}:${String(votingTimeLeft % 60).padStart(2, '0')}`;
        votingTimeLeft--;
    }, 1000);
}

function startVotingTimer() {
    let votingTimeLeft = 10; // 10 seconds for demo purposes
    const votingInterval = setInterval(() => {
        votingTimerElement.textContent = `${String(Math.floor(votingTimeLeft / 60)).padStart(2, '0')}:${String(votingTimeLeft % 60).padStart(2, '0')}`;
        
        if (votingTimeLeft > 0) {
            votingTimeLeft--;
        } else {
            clearInterval(votingInterval);
            fetchContestants();
        }
    }, 1000);
}

// Call startVotingTimer function to initiate voting countdown
startVotingTimer();
