(function () {
    // Inject the modal HTML
    const modal = document.createElement('div');
    modal.id = 'logoutModal';
    modal.className = 'logout-modal';
    modal.innerHTML = `
        <div class="logout-modal-box">
            <div class="logout-modal-icon">😢</div>
            <p class="logout-modal-title">Are you sure?</p>
            <p class="logout-modal-sub">We are going to miss you&hellip;</p>
            <div class="logout-modal-btns">
                <button class="logout-modal-confirm" id="logoutConfirm">YES, LOG OUT</button>
                <button class="logout-modal-cancel" id="logoutCancel">STAY</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Hook the logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            modal.classList.add('active');
        });
    }


    document.getElementById('logoutConfirm').addEventListener('click', function () {
        sessionStorage.clear();
        window.location.href = 'login.html';
    });


    document.getElementById('logoutCancel').addEventListener('click', function () {
        modal.classList.remove('active');
    });


    modal.addEventListener('click', function (e) {
        if (e.target === modal) modal.classList.remove('active');
    });
})();
