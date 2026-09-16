let referenceNo = null;
let subscriberId = null;


// ==========================================
// SHOW API RESPONSE
// ==========================================
function showResponse(data) {

    const responseElement =
        document.getElementById("response");

    responseElement.textContent =
        JSON.stringify(data, null, 2);
}


// ==========================================
// UPDATE STATUS
// ==========================================
function updateStatus(text, type) {

    const statusBadge =
        document.getElementById("statusBadge");

    statusBadge.textContent = text;

    statusBadge.className = "status " + type;
}


// ==========================================
// SET BUTTON LOADING STATE
// ==========================================
function setButtonLoading(buttonId, isLoading, loadingText) {

    const button =
        document.getElementById(buttonId);

    if (isLoading) {

        button.dataset.originalText =
            button.textContent;

        button.textContent =
            loadingText;

        button.disabled = true;

    } else {

        button.textContent =
            button.dataset.originalText ||
            button.textContent;

        button.disabled = false;
    }
}


// ==========================================
// REQUEST OTP
// ==========================================
async function requestOTP() {

    const mobileNumber =
        document
            .getElementById("mobileNumber")
            .value
            .trim();

    if (!mobileNumber) {

        alert("Please enter a mobile number.");

        return;
    }


    updateStatus("Requesting...", "loading");

    showResponse({
        message: "Sending OTP request..."
    });

    setButtonLoading(
        "requestOtpButton",
        true,
        "Sending OTP..."
    );


    try {

        const response = await fetch(
            "/api/otp/request",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    mobileNumber: mobileNumber
                })
            }
        );


        const result =
            await response.json();


        showResponse(result);


        // Check successful IdeaPro response
        if (
            result.success &&
            result.data &&
            result.data.statusCode === "S1000"
        ) {

            referenceNo =
                result.data.referenceNo;


            updateStatus(
                "OTP Sent",
                "success"
            );


            // Enable OTP verification
            document
                .getElementById("otp")
                .disabled = false;

            document
                .getElementById("verifyOtpButton")
                .disabled = false;

            document
                .getElementById("verifyCard")
                .classList.remove("disabled-card");


            alert(
                "OTP sent successfully!"
            );

        } else {

            updateStatus(
                "Request Failed",
                "error"
            );

            console.error(
                "IdeaPro OTP response:",
                result
            );

        }

    } catch (error) {

        console.error(error);

        showResponse({
            success: false,
            message: error.message
        });

        updateStatus(
            "Error",
            "error"
        );

    } finally {

        setButtonLoading(
            "requestOtpButton",
            false
        );
    }
}


// ==========================================
// VERIFY OTP
// ==========================================
async function verifyOTP() {

    const otp =
        document
            .getElementById("otp")
            .value
            .trim();


    if (!referenceNo) {

        alert(
            "Please request an OTP first."
        );

        return;
    }


    if (!otp) {

        alert(
            "Please enter the OTP."
        );

        return;
    }


    updateStatus(
        "Verifying...",
        "loading"
    );


    showResponse({
        message: "Verifying OTP..."
    });


    setButtonLoading(
        "verifyOtpButton",
        true,
        "Verifying..."
    );


    try {

        const response = await fetch(
            "/api/otp/verify",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    referenceNo: referenceNo,
                    otp: otp
                })
            }
        );


        const result =
            await response.json();


        showResponse(result);


        if (
            result.success &&
            result.data &&
            result.data.statusCode === "S1000"
        ) {

            subscriberId =
                result.data.subscriberId;


            updateStatus(
                "Verified",
                "success"
            );


            // Enable SMS section
            document
                .getElementById("message")
                .disabled = false;

            document
                .getElementById("sendSmsButton")
                .disabled = false;

            document
                .getElementById("smsCard")
                .classList.remove("disabled-card");


            alert(
                "OTP verified successfully!"
            );


            console.log(
                "Subscriber ID:",
                subscriberId
            );

        } else {

            updateStatus(
                "Verification Failed",
                "error"
            );

        }

    } catch (error) {

        console.error(error);

        showResponse({
            success: false,
            message: error.message
        });

        updateStatus(
            "Error",
            "error"
        );

    } finally {

        setButtonLoading(
            "verifyOtpButton",
            false
        );
    }
}


// ==========================================
// SEND SMS
// ==========================================
async function sendSMS() {

    const message =
        document
            .getElementById("message")
            .value
            .trim();


    if (!subscriberId) {

        alert(
            "Please verify OTP first."
        );

        return;
    }


    if (!message) {

        alert(
            "Please enter a message."
        );

        return;
    }


    updateStatus(
        "Sending SMS...",
        "loading"
    );


    showResponse({
        message: "Sending SMS..."
    });


    setButtonLoading(
        "sendSmsButton",
        true,
        "Sending..."
    );


    try {

        const response = await fetch(
            "/api/sms/send",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    subscriberId: subscriberId,
                    message: message
                })
            }
        );


        const result =
            await response.json();


        showResponse(result);


        if (
            result.success &&
            result.data &&
            result.data.statusCode === "S1000"
        ) {

            updateStatus(
                "SMS Sent",
                "success"
            );


            alert(
                "SMS sent successfully!"
            );

        } else {

            updateStatus(
                "SMS Failed",
                "error"
            );

        }

    } catch (error) {

        console.error(error);

        showResponse({
            success: false,
            message: error.message
        });

        updateStatus(
            "Error",
            "error"
        );

    } finally {

        setButtonLoading(
            "sendSmsButton",
            false
        );
    }
}