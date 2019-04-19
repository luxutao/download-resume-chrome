chrome.runtime.onInstalled.addListener(function () {
    chrome.tabs.create({ 'url': chrome.runtime.getURL('/html/options.html') })
})

// 上传文件流
function uploadResumeFile(filestring, callback) {
    var form = new FormData();
    form.append("jianli", filestring);
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://hr.yixia.com/api/recruit/uploadJianli", true)
    xhr.send(form)
    xhr.onload = function (resp) {
        return callback(resp)
    }
}

// 下载简历
function downloadResumeFile(resume_url) {
    if (resume_url.indexOf('51job.com') != -1) {
        // 第一种打开一个标签页进行下载
        // chrome.tabs.create({ url: resume_url, active: false }, function (tab) {
        //     console.log(tab.id)
        //     var closeTab = setInterval(function () {
        //         chrome.downloads.search({}, function (resp) {
        //             console.log(resp[0].state == "complete" && resp[0].url == resume_url)
        //             if (resp[0].state == "complete" && resp[0].url == resume_url) {
        //                 chrome.tabs.remove(tab.id, function (resp) { console.log(resp) })
        //                 clearInterval(closeTab)
        //             }
        //         })
        //     }, 500)
        // })

        // 第二种直接后台下载
        var downloadResume = new XMLHttpRequest();
        downloadResume.open('GET', resume_url, true)
        downloadResume.withCredentials = true
        downloadResume.onload = function (resp) {
            parser = new DOMParser();
            htmlDoc = parser.parseFromString(this.response, "text/html");
            var form = $("<form>");//定义一个form表单
            form.attr("id", "downloadResume");
            form.attr("style", "display:none");
            form.attr("target", "");
            form.attr("method", "post");
            form.attr("action", resume_url);
            var input1 = $("<input>");
            input1.attr("type", "hidden");
            input1.attr("name", "__VIEWSTATE");
            input1.attr("value", htmlDoc.getElementById('__VIEWSTATE').value);
            var input2 = $("<input>");
            input2.attr("type", "hidden");
            input2.attr("name", "__VIEWSTATEGENERATOR");
            input2.attr("value", htmlDoc.getElementById('__VIEWSTATEGENERATOR').value);
            var input3 = $("<input>");
            input3.attr("type", "hidden");
            input3.attr("name", "hidExportFolder");
            input3.attr("value", htmlDoc.getElementById('hidExportFolder').value);
            var input4 = $("<input>");
            input4.attr("type", "hidden");
            input4.attr("name", "hidExportFilter");
            input4.attr("value", htmlDoc.getElementById('hidExportFilter').value);
            var input5 = $("<input>");
            input5.attr("type", "hidden");
            input5.attr("name", "hidExportSeqID");
            input5.attr("value", htmlDoc.getElementById('hidExportSeqID').value);
            var input6 = $("<input>");
            input6.attr("type", "hidden");
            input6.attr("name", "hidExportJobID");
            input6.attr("value", htmlDoc.getElementById('hidExportJobID').value);
            var input7 = $("<input>");
            input7.attr("type", "hidden");
            input7.attr("name", "hidExportFormat");
            input7.attr("value", htmlDoc.getElementById('hidExportFormat').value);
            var input8 = $("<input>");
            input8.attr("type", "hidden");
            input8.attr("name", "hidExportPage");
            input8.attr("value", htmlDoc.getElementById('hidExportPage').value);
            form.append(input1);
            form.append(input2);
            form.append(input3);
            form.append(input4);
            form.append(input5);
            form.append(input6);
            form.append(input7);
            form.append(input8)
            $("body").append(form);
            form.submit()
            $("form").remove()
        }
        downloadResume.send()
    } else {
        chrome.downloads.download({ url: resume_url }, function (item_id) {
            chrome.downloads.search({ 'id': item_id }, function (item_info) {
                path = item_info[0].filename.split('/')
                filename = path[path.length - 1]
                // resumeInfo['filename'] = filename
                console.log(item_info)
            })
            console.log(item_id)
        })
    }
}

// 获得文件流
function getResumeFileByte(resume_url, callback) {
    if (resume_url.indexOf('51job.com') != -1) {
        var getResumePage = new XMLHttpRequest();
        getResumePage.open('GET', resume_url, true)
        getResumePage.withCredentials = true
        getResumePage.onload = function (resp) {
            console.log(resp)
            parser = new DOMParser();
            htmlDoc = parser.parseFromString(this.response, "text/html");
            var getResumeByte = new XMLHttpRequest()
            var formData = new FormData()
            getResumeByte.responseType = 'blob';
            getResumeByte.open('POST', resume_url, true)
            getResumeByte.withCredentials = true
            getResumeByte.onload = function (resp) {
                callback(this.response)
                console.log(this.response)
            }
            formData.append('__VIEWSTATE', htmlDoc.getElementById('__VIEWSTATE').value)
            formData.append('__VIEWSTATEGENERATOR', htmlDoc.getElementById('__VIEWSTATEGENERATOR').value)
            formData.append('hidExportFolder', htmlDoc.getElementById('hidExportFolder').value)
            formData.append('hidExportFilter', htmlDoc.getElementById('hidExportFilter').value)
            formData.append('hidExportSeqID', htmlDoc.getElementById('hidExportSeqID').value)
            formData.append('hidExportJobID', htmlDoc.getElementById('hidExportJobID').value)
            formData.append('hidExportFormat', htmlDoc.getElementById('hidExportFormat').value)
            formData.append('hidExportPage', htmlDoc.getElementById('hidExportPage').value)
            getResumeByte.send(formData)
        }
        getResumePage.send();
    } else {
        var general = new XMLHttpRequest();
        general.responseType = 'blob';
        general.withCredentials = true
        general.open('GET', resume_url, true)
        general.onload = function (resp) {
            callback(this.response)
        }
        general.send()
    }
}

// 执行下载的各个操作
function transferData(userinfo, resume_url, channel_name_en) {
    downloadResumeFile(resume_url)
    getResumeFileByte(resume_url, function (resp) {
        uploadResumeFile(resp, function (resume_path) {
            console.log(resume_path)
            userinfo['jianli_url'] = JSON.parse(resume_path.target.response).data.res
            userinfo['account'] = localStorage.getItem(channel_name_en)
            console.log(userinfo)
            // 获得渠道的id
            $.get('http://hr.yixia.com/api/recruit/getChannelId?channel_name=' + userinfo['channel_name'], function (resp) {
                userinfo['channel_id'] = resp.data.res
                $.get('http://hr.yixia.com/api/recruit/joblist?job_name=' + userinfo.job_name, function (resp) {
                    console.log(resp)
                    console.log(resp.data.length)
                    if (resp.data.length == 0) {
                        // 添加职位信息并返回职位的id
                        jobData = {
                            "job": {
                                "name": userinfo.job_name,
                                "num": 1,
                                "channel_id": userinfo.channel_id,
                                "account": userinfo.account
                            }
                        }
                        console.log(userinfo)
                        console.log(jobData)
                        $.post('http://hr.yixia.com/api/recruit/jobAdd', jobData, function (resp) {
                            console.log(resp)
                            userinfo['job_id'] = resp.data.id
                            console.log(userinfo)
                            $.post('http://hr.yixia.com/api/recruit/candidateAdd', { "candidate": userinfo }, function (resp) {
                                localStorage.setItem('resumeS', Number(localStorage.getItem('resumeS')) + 1)
                            })
                        })
                    } else {
                        for (var pk in resp.data) {
                            userinfo['job_id'] = resp.data[pk].id
                            $.post('http://hr.yixia.com/api/recruit/candidateAdd', { "candidate": userinfo }, function (resp) {
                                localStorage.setItem('resumeS', Number(localStorage.getItem('resumeS')) + 1)
                            })
                        }
                    }
                })
            })
        })
    })
}

// 监听content发送数据到bg
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        var userDetail = JSON.parse(request.greeting);
        transferData(userDetail, userDetail.resume_url, userDetail.channel_name_en)
        delete userDetail['resume_url']
        delete userDetail['channel_name_en']
        sendResponse("bar");
    }
)