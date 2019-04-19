// 获得页面变量信息
function setDocument(v) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.innerHTML = "document.body.setAttribute('itemData', JSON.stringify(" + v + "));";
    document.body.appendChild(script);
    document.body.removeChild(script);
    return JSON.parse(document.body.getAttribute('itemData'))
}


// 注入网页的js
function getUserInfo(callback) {
    switch (document.location.host) {
        case 'easy.lagou.com':
            var itemData = setDocument('itemData')
            var userinfo = {}
            userinfo['name'] = itemData.candidateName
            userinfo['phone'] = itemData.phone
            userinfo['email'] = itemData.email
            userinfo['last_com'] = itemData.lastCompanyName || ""
            userinfo['job_name'] = itemData.positionName
            userinfo['channel_name'] = '拉勾网'
            userinfo['channel_name_en'] = 'lagou'
            userinfo['channel_id'] = 0
            userinfo['resume_url'] = 'https://easy.lagou.com/resume/download.htm?resumeId=' + itemData.id
            callback(JSON.stringify(userinfo))
            break
        case 'lpt.liepin.com':
            var $CONFIG = setDocument('$CONFIG')
            var userinfo = {}
            var col = document.getElementsByClassName('col')
            userinfo['name'] = col[0].innerText
            userinfo['phone'] = col[2].innerText.replace(' 已验证', '')
            userinfo['email'] = col[4].innerText.replace(' 已验证', '')
            userinfo['job_name'] = decodeURI(document.location.href.split('&')[1].split('=')[1])
            userinfo['last_com'] = document.getElementsByClassName('col filter-zone')[1].innerText || ""
            userinfo['channel_name'] = '猎聘网'
            userinfo['channel_name_en'] = 'liepin'
            userinfo['channel_id'] = 0
            userinfo['resume_url'] = 'https://lpt.liepin.com/resume/export?res_id_encode=' + $CONFIG.resume.res_id_encode + '&language=0&apply_id=' + $CONFIG.extension.applyId + '&resume_fmt=word'
            callback(JSON.stringify(userinfo))
            break
        case 'rd5.zhaopin.com':
            var query = setDocument('window.$query')
            var userinfo = {}
            // 获得用户的详细信息
            var user_detail = new XMLHttpRequest();
            user_detail.open('GET', 'https://rdapi.zhaopin.com/rd/resume/detail?_=' + new Date().getTime() + '&resumeNo=' + query.resumeNo, true);
            user_detail.withCredentials = true;
            user_detail.onload = function (resp) {
                var detail = JSON.parse(this.response)
                userinfo['name'] = detail.data.detail.UserMasterName
                userinfo['phone'] = detail.data.candidate.mobilePhone
                userinfo['email'] = detail.data.candidate.email
                userinfo['last_com'] = detail.data.detail.CurrentCompanyName || ""
                userinfo['job_name'] = detail.data.job.jobTitle
                userinfo['channel_name'] = '智联招聘'
                userinfo['channel_name_en'] = 'zhilian'
                userinfo['channel_id'] = 0
                // 创建一个下载的任务
                var task = new XMLHttpRequest();
                task.open('POST', 'https://rdapi.zhaopin.com/rd/resume/saveToLocal/startTask?_=' + new Date().getTime(), false)
                task.withCredentials = true
                task.onload = function (resp) {
                    var task_detail = JSON.parse(this.response)
                    console.log(task_detail)
                    // 因为创建完成任务之后有一段时间才会生成简历的链接，所以等待3秒
                    setTimeout(function () {
                        var key = task_detail.data.key
                        var saveToLocal = new XMLHttpRequest();
                        saveToLocal.open('POST', 'https://rdapi.zhaopin.com/rd/resume/saveToLocal/getFile?_=' + new Date().getTime(), true)
                        saveToLocal.withCredentials = true
                        saveToLocal.onload = function (resp) {
                            console.log(this.response)
                            var resume_detail = JSON.parse(this.response)
                            console.log(resume_detail.data.data.filePath)
                            userinfo['resume_url'] = 'https://rd5.zhaopin.com/ihrapi/api/resume/getFileIo.do?key=' + key
                            callback(JSON.stringify(userinfo))
                        }
                        saveToLocal.send(JSON.stringify({ "key": key }))
                    }, 3000)
                }
                task.send(JSON.stringify({ "fileType": "1", "jobResumeIds": query.resumeNo }))
            };
            user_detail.send()
            break
        case 'ehire.51job.com':
            // 获得tokenid
            var userinfo = {}
            userinfo['name'] = document.title
            userinfo['phone'] = document.getElementsByClassName('infr')[0].children[0].children[1].children[1].textContent
            userinfo['email'] = document.getElementsByClassName('infr')[0].children[0].children[1].children[2].textContent
            userinfo['last_com'] = document.getElementsByClassName('txt2')[1].textContent
            userinfo['job_name'] = $('#hidSMSJobName').val()
            userinfo['channel_name'] = '前程无忧'
            userinfo['channel_name_en'] = 'qiancheng'
            userinfo['channel_id'] = 0
            var formData = new FormData();
            formData.append('doType', 'GetExportID')
            var get_detail = new XMLHttpRequest();
            get_detail.open('POST', 'https://ehire.51job.com/Ajax/InboxResume/GlobalExportDivAjax.ashx', false);
            get_detail.withCredentials = true
            get_detail.onload = function (resp) {
                var xml_data = resp.target.response
                var parser = new DOMParser();
                var xmlDoc = parser.parseFromString(xml_data, "text/xml");
                //提取数据  
                var token = xmlDoc.getElementsByTagName('message')[0].textContent;
                userinfo['resume_url'] = "http://cvs.ehire.51job.com/Download.aspx?num=" + Math.random() + "&lang=&" + token + "&s=" + $('#hidSeqID').val() + "&j=" + $('#hidJobID').val() + "&fa=Pdf&f=" + $('#hidFolder').val() + "&fi=" + $('#hidIsFilter').val()
                callback(JSON.stringify(userinfo))
            }
            get_detail.send(formData)
            break
    }
}

setTimeout(function () {
    $('body').append(
        '<style rel="stylesheet" type="text/css" href="' +
        chrome.runtime.getURL('css/content.css') + '">'
    )
    $('body').append(
        '<img class="keepIcon run" src="' +
        chrome.runtime.getURL('images/logo.png') + '">'
    )
    $('.keepIcon').click(function () {
        getUserInfo(function (userInfo) {
            chrome.runtime.sendMessage({ greeting: userInfo }, function (response) {
                console.log(userInfo)
            })
        })
    })
}, 500);
