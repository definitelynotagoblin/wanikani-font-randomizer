document.addEventListener('DOMContentLoaded', function() {
    function updateSubOptionsState() {
        if (checkboxes.global.checked) {
            subOptions.classList.remove('disabled');
        } else {
            subOptions.classList.add('disabled');
        }
    }

    function updateSettings() {
        browser.tabs.query({active: true, currentWindow: true}, function(tabs) {
            browser.tabs.sendMessage(tabs[0].id, {
                action: "updateSettings",
                enabledGlobal: checkboxes.global.checked,
                enabledQuiz: checkboxes.quiz.checked,
                enabledReview: checkboxes.review.checked,
                enabledExtraStudy: checkboxes.extraStudy.checked
            });
        });
    }
    const checkboxes = {
        global: document.getElementById('enabledGlobal'),
        quiz: document.getElementById('enabledQuiz'),
        review: document.getElementById('enabledReview'),
        extraStudy: document.getElementById('enabledExtraStudy')
    };
    const subOptions = document.querySelector('.sub-options');

    // Load saved settings
    browser.storage.local.get(['enabledGlobal', 'enabledQuiz', 'enabledReview', 'enabledExtraStudy'], function(result) {
        checkboxes.global.checked = result.enabledGlobal !== false;
        checkboxes.quiz.checked = result.enabledQuiz !== false;
        checkboxes.review.checked = result.enabledReview !== false;
        checkboxes.extraStudy.checked = result.enabledExtraStudy !== false;
        updateSubOptionsState();
    });

    // Save settings when changed
    for (let key in checkboxes) {
        checkboxes[key].addEventListener('change', function() {
            let settings = {};
            settings[`enabled${key.charAt(0).toUpperCase() + key.slice(1)}`] = this.checked;
            browser.storage.local.set(settings);
            if (key === 'global') {
                updateSubOptionsState();
            }
            updateSettings();
        });
    }

    const shuffleButton = document.getElementById('shuffleFont');
    shuffleButton.addEventListener('click', function() {
        browser.tabs.query({active: true, currentWindow: true}, function(tabs) {
            browser.tabs.sendMessage(tabs[0].id, {action: "shuffleFont"});
        });
    });
});