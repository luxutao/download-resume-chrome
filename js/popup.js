$(function () {
    $('code')[1].innerText = localStorage.getItem('resumeS')
})

// 点击设置按钮执行的操作
document.addEventListener('DOMContentLoaded', function () {
    var settingButton = document.getElementById('setting');
    settingButton.addEventListener('click', function () {
        chrome.tabs.create({ 'url': chrome.runtime.getURL('/html/options.html') })
    });
});
