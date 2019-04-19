$('#lagou').val(localStorage.getItem("lagou") || "")
$('#liepin').val(localStorage.getItem("liepin") || "")
$('#zhilian').val(localStorage.getItem("zhilian") || "")
$('#qiancheng').val(localStorage.getItem("qiancheng") || "")
$('#saveData').click(function () {
    var lagou = $('#lagou').val()
    var liepin = $('#liepin').val()
    var zhilian = $('#zhilian').val()
    var qiancheng = $('#qiancheng').val()
    localStorage.setItem("lagou", lagou);
    localStorage.setItem("liepin", liepin);
    localStorage.setItem("zhilian", zhilian);
    localStorage.setItem("qiancheng", qiancheng);
    localStorage.setItem("resumeS", 0);
    alert('保存成功, 即将退出。')
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.remove(tabs[0].id, function () { })
    })
})