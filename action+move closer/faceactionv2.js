var video, streamRefQR;
var canvas, canvasElement;
var streamRef, videoElem;
var videoOcr, streamRefOCR;
var canvasElementOcr;
var canvasOcr;
var settimethree;
var settimeten;
var doLoop=true;
var setshowmask;
var setshowglass;
var startCheckRealFace=false;
var videoSelectOcr;
var camera_select;
var pairImg;
var countFake=0;
var checkrealdata=[];
// var checkrealarr=["high","low","ok"];
var checkrealarr=["ok","low","ok"];
var countcheckreal=0;
var facedata = [];
var faceaction = ["center", "open mouth", "close eyes", "head down", "head up", "turn left", "turn right", "tilt face left", "tilt face right"];
var faceclass = {
    "center": 0,
    "open mouth": 1,
    "close eyes": 2,
    "head down": 3,
    "head up": 4,
    "turn left": 5,
    "turn right": 6,
    "tilt face left": 7,
    "tilt face right": 8
};
var randomNumbers = [];
var countaction = 0;
// let iOS = (/iPad|iPhone|iPod/.test(navigator.platform) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) && !window.MSStream;

// document.getElementById('text').onclick = changeColor;
//
//     function changeColor() {
//         document.getElementById("active-2").style.color = 'red'
//         return false;
//     }
$("#overlay").fadeIn();
window.addEventListener('message', function (event) {
    var data = event.data.split(',');
    console.log(data[0]+','+data[4]);
    if (event.data == "Camera can't open") {
        setTimeout(() => {
            document.getElementById('iFrame').contentWindow.postMessage('opencamera', '*');
        }, "1000");
    }
    if (event.data == "Camera open") setcount();
    if (data[2] != "undefined") {
        // $("#resultimg").attr("src", "data:image/png;base64," + data[1]);
        // $("#resultpredict").html(data[0]);
        checkdata(data);
    }
    // insert text warning mask,glasses cover face
    if (data[0] == "mask") {
        // when time pass after 10 sec text show
        $(".text-covered").show();
        var myElement = document.getElementById("text-covered");
        myElement.textContent = "mask";
        clearInterval(setshowglass);
        clearInterval(setshowmask);
        // Function to show .text-covered after 10 seconds
        setshowmask= setTimeout(function() {
            $(".text-covered").hide();

        }, 2000); // 10000 milliseconds = 10 seconds


    }
    if (data[0] == "glasses") {
        // when time pass after 10 sec text show
        $(".text-covered").show();

        var myElement = document.getElementById("text-covered");
        myElement.textContent = "glasses";
        clearInterval(setshowglass);
        clearInterval(setshowmask);
        // Function to show .text-covered after 10 seconds
        setshowglass = setTimeout(function() {
            $(".text-covered").hide();

        }, 2000); // 10000 milliseconds = 10 seconds
    }

    setcountthree();
    // console.log("Message received from the child: " + data[0]); // Message received from child
});

function setcountthree() {
    var timelef = 4;
    clearInterval(settimethree);
    settimethree = setInterval(function () {
        if (timelef <= 0) {
            clearInterval(settimethree);
            clearInterval(settimeten);
            resetTimeout("Lost focus in 3 seconds.");
        }
        timelef -= 1;
    }, 1000);
}
function setFrameCamStyle() {
    var timeUp = 3000;
    var blinkCount = 0;
    var setFrame = null;

    clearInterval(setFrame);
    setFrame = setInterval(function() {
        var overlay = document.querySelector('.overlay-helper');
        var r = document.querySelector(':root');

        if (timeUp <= 0) {
            overlay.style.animation = 'none';
            r.style.setProperty('--border-style', '4px solid #D1D3D4');

        } else if (blinkCount < 3) {
            overlay.style.animation = 'blink-text 0.25s linear infinite';
            r.style.setProperty('--border-style', '4px solid #FF0000');
            blinkCount++;
        }

        timeUp -= 1;
    }, 300);
}

// function setFrameCamStyle() {
//     var timeUp = 10;
//     var setFrame = null;
//
//     clearInterval(setFrame);
//     setFrame = setInterval(function() {
//         var overlay = document.querySelector('.overlay-helper');
//         var r = document.querySelector(':root');
//
//         if (timeUp <= 0) {
//             overlay.style.animation = 'blink-text 0.25s linear infinite';
//             r.style.setProperty('--border-style', '4px solid #red');
//         }
//
//         timeUp -= 1;
//     }, 1000);
// }

function setcount() {

    setcountthree();

    var timeleft = 10;
    clearInterval(settimeten);
    settimeten = setInterval(function () {
        if (timeleft <= 0) {
            clearInterval(settimeten);
            clearInterval(settimethree);
            resetTimeout("Didn't take a picture in 10 seconds.");
        }
        $("#countseconds").html(timeleft)
        $("#count_camena2").show();


        timeleft -= 1;
    }, 1000);
    $("#count_camena2").hide();

}

// random capture
function startfacecapture() {
    $(".text-covered").hide();
    if($("#high").prop("checked")){
        $('#iFrame').attr('src', streamServer+'?level=high');
    }else{
        $('#iFrame').attr('src', streamServer);
    }

    // startTimer();

    $("#select_camena").hide();
    var numbers = [];
    for (var i = 1; i <= 8; i++) {
        numbers.push(i);
    }

// Shuffle the array using the Fisher-Yates algorithm
    for (var i = numbers.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = numbers[i];
        numbers[i] = numbers[j];
        numbers[j] = temp;
    }

// Take the first three numbers from the shuffled array
    randomNumbers = numbers.slice(0, $("#score").val());
    // randomNumbers.push(0);
    $("#textface").html(faceaction[randomNumbers[0]]);

    startTimer();
    $("#count_camena").show();

    //load camera
    var timeleft = 5;
    var downloadTimer = setInterval(function () {

        // When the user clicks anywhere outside of the modal, close it
        // window.onclick = function(event) {
        //     if (event.target == modal) {
        //         // window.location.reload();
        //         // alert("click outside");
        //     }
        // }

        if (timeleft <= 0) {
            clearInterval(downloadTimer);
            $("#show_camera").show();
            $("#count_camena").hide();

            $("#myBtn").click();
            document.getElementById('iFrame').contentWindow.postMessage('opencamera', '*');


            $("#modalcamera").modal("show");

            //
            // startfacecapture();
        }
        $("#seconds").html(timeleft);
        timeleft -= 1;
    }, 1000);
}



function cleartimeall() {
    setTimeout(() => {
        clearInterval(settimeten);
        clearInterval(settimethree);
    }, "1500");
}


function checkdata(data) {
    if(doLoop) {
        if (countaction == parseInt($("#score").val())) {
            doLoop=false;
            $("#textface").html("โปรดขยับเข้ามาไกล้ ๆ");
            // console.log(facedata);
// edit B
        } else {
            if (faceaction[randomNumbers[countaction]] == data[0]) {
                setFrameCamStyle();

                // $("#resultimg"+countaction).attr("src", "data:image/png;base64," + data[2]);
                // $("#resultpredict"+countaction).html(data[0]);


                // var html = ' <div class="col-12 col-md-6 col-lg-3 d-flex align-items-center justify-content-center">' +
                //     '                    <div class="active-resultcard ">' +
                //     '                        <h4>Face Action : <font color="green">' + data[0] + '</font></h4>' +
                //     '                        <img  src="data:image/png;base64,' + data[2] + '" width="100%" height="auto" />' +
                //     '                    </div>' +
                //     '                    </div>';


                var html = '<div class="col-sm-6 col-md-6 col-lg-3 pb-4 d-flex align-items-stretch">' +
                    '<div class="card">' +
                    '<img class="card-img-top" src="data:image/png;base64,' + data[2] + '" width="100%" height="auto">' +
                    '                <div class="card-body">' +
                    '                <h4 class="card-title"><font color="black">' + data[0].charAt(0).toUpperCase() + data[0].slice(1) + '</font></h4>' +
                    '            <p class="card-text">Face Action</p>' +
                    '        </div>' +
                    '        <div class="card-body border-cut-section"><span id="txtResult_' + faceclass[data[0]] + '">' +
                    '        <h4 class="card-title"><font color="green">Pass</font></h4>' +
                    '        <p class="card-text">Description :</p>' +
                    '<div class="text-error-code">' +
                    '        <h6 class="card-text">Verify success</h6><p class="card-text">Code : 000000</p> </span>' +
                    '</div>' +
                    '        </div>' +
                    '        </div>' +
                    '        </div>';

                $("#showImg").append(html);
                $("#showImg").addClass("row mt-cus mb-5");
                if (faceclass[data[0]] == 0) pairImg = data[2];
                else facedata.push({"action": faceclass[data[0]], "image": data[2]});

                countaction++;
                $("#textface").html(faceaction[randomNumbers[countaction]]);
                setcount();
            }
        }
    }else{
        //โปรดออกห่าง

        if(data[4]==checkrealarr[countcheckreal]){
            if(startCheckRealFace){
                if(data[0]!='FAKE') checkrealdata.push({"action": faceclass[data[0]], "image": data[2]});
                else countFake++

                if (faceclass[data[0]] == 0&&data[4]=="ok") pairImg = data[2];
            }else{
                startCheckRealFace=true;
                $("#textface").html("กำลังประมวลผล").css('color', 'orange');
                if(countcheckreal>=2) $("#textface").html("โปรดอยู่นิ่งๆ").css('color', 'green');
                setTimeout(() => {
                    setFrameCamStyle();
                    if(countcheckreal>=2){
                        var html = '<div class="col-sm-6 col-md-6 col-lg-3 pb-4 d-flex align-items-stretch">' +
                            '<div class="card">' +
                            '<img class="card-img-top" src="data:image/png;base64,' + pairImg + '" width="100%" height="auto">' +
                            '                <div class="card-body">' +
                            '                <h4 class="card-title"><font color="black">Center</font></h4>' +
                            '            <p class="card-text">Face Action</p>' +
                            '        </div>' +
                            '        <div class="card-body border-cut-section"><span id="txtResult_0">' +
                            '        <h4 class="card-title"><font color="green">Pass</font></h4>' +
                            '        <p class="card-text">Description :</p>' +
                            '<div class="text-error-code">' +
                            '        <h6 class="card-text">Verify success</h6><p class="card-text">Code : 000000</p> </span>' +
                            '</div>' +
                            '        </div>' +
                            '        </div>' +
                            '        </div>';

                        $("#showImg").append(html);
                        $("#showImg").addClass("row mt-cus mb-5");

                        cleartimeall();
                        var iframes = document.getElementsByTagName('iframe');
                        for (var i = 0; i < iframes.length; i++) {
                            iframes[i].parentNode.removeChild(iframes[i]);
                        }

                        $("#show_camera").hide();

                        $("#divSpinner").addClass("mt-5");
                        $("#divSpinner").fadeIn();

                        $("#modalcamera").modal("hide");
                        checkRealdata();
                    }else{
                        setcount();
                        countcheckreal++;
                        startCheckRealFace=false;
                        if(checkrealarr[countcheckreal]=="low") $("#textface").html("โปรดถอยออกไปห่าง ๆ").css('color', 'red');
                        else  $("#textface").html("ขยับเข้ามาอีกนิด").css('color', 'red');
                    }


                }, "2000");
            }
        }
    }
}
function checkRealdata(){
    console.log(checkrealdata);
    if(countFake>=5){
        Swal.fire({
            icon: 'error',
            title: 'ตรวจพบใบหน้าแปลกปลอม',
            html: 'ตรวจสอบไม่ผ่าน'
        }).then((result) => {
            location.reload();
        });
    }else  checkImageQuality();
}
function checkImageQuality() {
    var date_format_str = genDate();
    var objectToLiveness = {
        "reference_id":"TEST"+date_format_str,
        "tenant_id": tenantsulotion_id,
        "skip_enc":true,
        "internal":true,
        "skip_authen":true,
        "data": {
            "transaction_id": "DEMO" + date_format_str,
            "reference_id":"TEST"+date_format_str,
            "request_time": new Date().getTime(),
            "system_request": "platform",
            // "activity_code":activityCode !== undefined ||activityCode!==''? activityCode:"",
            "collection": {
                "image_quality": false,
                "liveness_action": true,
                "liveness": true,
                "image_compare": false,
                "liveness_action_same_person":true
            },
            "liveness_option": {
                "face_detect": 0,
                "eyes_open": 0
            },
            "pair_image": pairImg,
            "source_image": "",
            "action_image": facedata
        }
    }
    var url = '/apis/collect';
    $.ajax({
        type: "POST",
        url: url,
        data: JSON.stringify(objectToLiveness),
        contentType: 'application/json',
        success: function (data) {
            console.log(data);
            $("#resultImg").show();
            $("#application").html("Active Detect");
            $("#ResultText").html("");
            // console.log(data);
            $("#divSpinner").fadeOut();
            $("#result_camera").show();
            // console.log(data);
            var errorHtml = "";
            if (data.response_code == '000000') {

                if (data.data.liveness.response_code == '000000') {
                    errorHtml = '        <h4 class="card-title"><font color="green">Pass</font></h4>' +
                        '        <p class="card-text">Description :</p>' +
                        '<div class="text-error-code">' +
                        '        <h6 class="card-text">Verify success Score :  <font color="green"><b>'+data.data.liveness.data.score +'</b></font></h6>' +
                        '        <h6 class="card-text">Code : 000000 </h6>' +
                        '</div>';
                    $("#txtResult_0").html(errorHtml);
                    // $("#activeDetect").html("<center><h3> Result : <font color='green'>Pass (Liveness)</font color='black'><br> Score : " + data.data.liveness.data.score + "</h3></center>");
                }else if(data.status=="error"){
                    errorHtml = '        <h4 class="card-title"><font color="red">Not Pass</font></h4>' +
                        '        <p class="card-text">Description :</p>' +
                        '<div class="text-error-code">' +
                        '        <h6 class="card-text">' + data.description + '</h6>';
                    if (data.response_code != '') errorHtml += ' <h6 class="card-text">Code : ' + data.response_code + '</h6>';
                    errorHtml += '</div>';
                    for (var k = 0; k < randomNumbers.length; k++)  $("#txtResult_" + randomNumbers[k]).html(errorHtml);
                    $("#txtResult_sourceImg").html(errorHtml);
                } else {
                    errorHtml = '        <h4 class="card-title"><font color="red">Not Pass (Liveness)</font></h4>' +
                        '        <p class="card-text">Description :</p>' +
                        '<div class="text-error-code">' +
                        '        <h6 class="card-text">' + data.data.liveness.description + '</h6>' +
                        '        <h6 class="card-text">Code : ' + data.data.liveness.response_code + '</h6>' +
                        '</div>';
                    $("#txtResult_0").html(errorHtml);
                    // $("#activeDetect").html("<center><h3> Result : <font color='red'>Not Pass</font></h3></center>");
                }
                $("#txtResult_sourceImg").html(errorHtml);
            } else {
                var livenessActionArr = data.data.liveness_action;
                console.log(livenessActionArr);
                for (var k = 0; k < livenessActionArr.length; k++) {
                    var livenessLoop = livenessActionArr[k];
                    console.log(livenessLoop);

                    if (livenessLoop.response_code !== '000000') {
                        errorHtml = '        <h4 class="card-title"><font color="red">Not Pass</font></h4>' +
                            '        <p class="card-text">Description :</p>' +
                            '<div class="text-error-code">' +
                            '        <h6 class="card-text">' + livenessLoop.description + '</h6>' ;
                        if (livenessLoop.response_code != '') errorHtml += ' <h6 class="card-text">Code : ' + livenessLoop.response_code + '</h6>';
                        errorHtml +=  '</div>';
                        $("#txtResult_" + livenessLoop.action).html(errorHtml);
                    }
                }
                errorHtml = '        <h4 class="card-title"><font color="red">Not Pass</font></h4>' +
                    '        <p class="card-text">Description :</p>' +
                    '<div class="text-error-code">' +
                    '        <h6 class="card-text">Liveness Action not pass</h6>' +
                    '        <h6 class="card-text">Code : \t&nbsp; -</h6>' +
                    '</div>';
                $("#txtResult_0").html(errorHtml);
                $("#txtResult_sourceImg").html(errorHtml);
                // $("#activeDetect").html("<center><h3> Result : <font color='red'>Not Pass</font></h3></center>");

            }
        }
    });
}

function resetTimeout(message) {
    var iframes = document.getElementsByTagName('iframe');
    for (var i = 0; i < iframes.length; i++) {
        iframes[i].parentNode.removeChild(iframes[i]);
    }

    $("#show_camera").hide();
    Swal.fire({
        icon: 'error',
        icon: 'error',
        title: 'Time out',
        html: message
    }).then((result) => {
        location.reload();
    });
}

// jQuery('<div class="quantity-nav"><div class="quantity-button quantity-up">+</div><div class="quantity-button quantity-down">-</div></div>').insertAfter('.quantity input');
jQuery('.quantity').each(function () {
    var spinner = jQuery(this),
        input = spinner.find('input[type="number"]'),
        btnUp = spinner.find('.quantity-up'),
        btnDown = spinner.find('.quantity-down'),
        min = input.attr('min'),
        max = input.attr('max');

    btnUp.click(function () {
        var oldValue = parseFloat(input.val());
        if (oldValue >= max) {
            var newVal = oldValue;
        } else {
            var newVal = oldValue + 1;
        }
        spinner.find("input").val(newVal);
        spinner.find("input").trigger("change");
    });

    btnDown.click(function () {
        var oldValue = parseFloat(input.val());
        if (oldValue <= min) {
            var newVal = oldValue;
        } else {
            var newVal = oldValue - 1;
        }
        spinner.find("input").val(newVal);
        spinner.find("input").trigger("change");
    });

});
$("#score").change(function () {
    if (this.value < 1 || this.value > 3) {
        Swal.fire({
            icon: 'error',
            icon: 'error',
            title: 'Invalid number',
            html: ' Please fill random action between 1 - 3  '
        }).then((result) => {
            if (this.value > 3) $(this).val(3);
            else if (this.value < 1) $(this).val(1);
        });
    }
});

// Get the modal
var modal = document.getElementById("modalcamera");

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal
btn.onclick = function () {
    modal.style.display = "block";
}


// *********count before camera open***********
const FULL_DASH_ARRAY = 283;
const WARNING_THRESHOLD = 10;
const ALERT_THRESHOLD = 5;

const COLOR_CODES = {
    info: {
        color: "green"
    },
    warning: {
        color: "orange",
        threshold: WARNING_THRESHOLD
    },
    alert: {
        color: "red",
        threshold: ALERT_THRESHOLD
    }
};

const TIME_LIMIT = 5;
let timePassed = 0;
let timeLeft = TIME_LIMIT;
let timerInterval = null;
let remainingPathColor = COLOR_CODES.info.color;

document.getElementById("app").innerHTML = `
<div class="base-timer">
  <svg class="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g class="base-timer__circle">
      <circle class="base-timer__path-elapsed" cx="50" cy="50" r="45"></circle>
      <path
        id="base-timer-path-remaining"
        stroke-dasharray="283"
        class="base-timer__path-remaining ${remainingPathColor}"
        d="
          M 50, 50
          m -45, 0
          a 45,45 0 1,0 90,0
          a 45,45 0 1,0 -90,0
        "
      ></path>
    </g>
  </svg>
  <span id="base-timer-label" class="base-timer__label">${formatTime(
    timeLeft
)}</span>
</div>
`;

function onTimesUp() {
    clearInterval(timerInterval);
    // $("#app").hide();
}

function startTimer() {
    timerInterval = setInterval(() => {
        timePassed = timePassed += 1;
        timeLeft = TIME_LIMIT - timePassed;
        document.getElementById("base-timer-label").innerHTML = formatTime(
            timeLeft
        );
        setCircleDasharray();
        setRemainingPathColor(timeLeft);

        if (timeLeft === 0) {
            onTimesUp();
        }
    }, 1000);
}

function formatTime(time) {
    const minutes = Math.floor(time / 60);
    let seconds = time % 60;

    if (seconds < 10) {
        seconds = `0${seconds}`;
    }

    return `${minutes}:${seconds}`;
}

function setRemainingPathColor(timeLeft) {
    const {alert, warning, info} = COLOR_CODES;
    if (timeLeft <= alert.threshold) {
        document
            .getElementById("base-timer-path-remaining")
            .classList.remove(warning.color);
        document
            .getElementById("base-timer-path-remaining")
            .classList.add(alert.color);
    } else if (timeLeft <= warning.threshold) {
        document
            .getElementById("base-timer-path-remaining")
            .classList.remove(info.color);
        document
            .getElementById("base-timer-path-remaining")
            .classList.add(warning.color);
    }
}

function calculateTimeFraction() {
    const rawTimeFraction = timeLeft / TIME_LIMIT;
    return rawTimeFraction - (1 / TIME_LIMIT) * (1 - rawTimeFraction);
}

function setCircleDasharray() {
    const circleDasharray = `${(
        calculateTimeFraction() * FULL_DASH_ARRAY
    ).toFixed(0)} 283`;
    document
        .getElementById("base-timer-path-remaining")
        .setAttribute("stroke-dasharray", circleDasharray);
}

/************ input number of posture js *************/
const incrementButton = document.querySelector("#increment");
const decrementButton = document.querySelector("#decrement");
const quantityInput = document.querySelector("#quantity");

incrementButton.addEventListener("click", () => {
    quantityInput.value = parseInt(quantityInput.value) + 1;
});
decrementButton.addEventListener("click", () => {
    quantityInput.value = parseInt(quantityInput.value) - 1;
});

