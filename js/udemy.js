// Variables Declarations
const certificateDiv = document.getElementById("certificate");
const downloadButton = document.getElementById("download");
const container = document.querySelector(".container");
const formElement = document.getElementById("form"); // To hide if it exists, or remove if form HTML is removed

// --- Function to generate a more unique-looking ID string ---
function generateCertificateUID() {
    const S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    // Generates a longer, more UUID-like string (though not a true UUID)
    return (S4()+S4()+"-"+S4()+"-4"+S4().substr(0,3)+"-"+S4()+"-"+S4()+S4()+S4()).toLowerCase();
}


// --- Function to handle certificate generation and display ---
function displayCertificate(data) {
  if (!certificateDiv || !downloadButton) {
    console.error("Certificate or download button element not found in the DOM.");
    if (container) {
        container.innerHTML = `<div class="error-message">
                                 <h1>Configuration Error</h1>
                                 <p>Certificate template elements are missing. Please check the HTML structure.</p>
                               </div>`;
    }
    return;
  }

  // Ensure all expected data properties exist, provide defaults if necessary
  const certData = {
    fname: data.fname || "Firstname",
    lname: data.lname || "Lastname",
    date: data.date || "January 1, 2024",
    length: data.length || "0",
    course: data.course || "Sample Course Title",
    teacher: data.teacher || "Instructor Name(s)",
  };

  let instructorsLabel = certData.teacher.includes(",") ? "Instructors" : "Instructor";

  // Use the new UID function
  const certificateUID = generateCertificateUID(); // More unique ID
  const simplifiedCertNo = certificateUID.substring(0, 25); // For display as "Certificate no"
  const referenceNumber = certificateUID.substring(certificateUID.length - 7); // For "Reference Number"


  const courseNameHTML = certData.course.replace(/\n/g, "<br>");

  if (formElement) formElement.style.display = "none";

  certificateDiv.style.backgroundColor = "#f8f9fb";
  certificateDiv.style.display = "flex";
  certificateDiv.innerHTML = `
    <div class="logo">
      <img id="udemy-logo" src="img/udemy-logo.png" alt="Udemy Logo">
      <div class="right-side">
        <div class="c-no">Certificate no: ${simplifiedCertNo}</div>
        <div class="c-url">Certificate url: ude.my/${simplifiedCertNo}</div>
        <div class="ref-no">Reference Number: ${referenceNumber}</div>
      </div>
    </div>
    <div class="content">
      <h3>CERTIFICATE OF COMPLETION</h3>
      <h1 id="course-name">${courseNameHTML}</h1>
      <h4>${instructorsLabel} <b>${certData.teacher}</b></h4>
    </div>
    <div class="user">
      <h1 id="name">${certData.fname} ${certData.lname}</h1>
      <h4>Date  <b>${certData.date}</b></h4>
      <h4>Length  <b>${certData.length} total hours</b></h4>
    </div>
  `;
  downloadButton.style.display = "block";
}

// --- Function to display an error message if parameters are missing ---
function displayParameterError(missingParams) {
  if (formElement) formElement.style.display = "none";
  if (certificateDiv) certificateDiv.style.display = "none";
  if (downloadButton) downloadButton.style.display = "none";

  let message = "<h1>Certificate Generation Error</h1>";
  message += "<p>The following required information was not provided or is invalid:</p><ul>";
  missingParams.forEach(param => {
    let readableParam = param;
    switch(param) {
        case 'fname': readableParam = 'First Name'; break;
        case 'lname': readableParam = 'Last Name'; break;
        case 'date': readableParam = 'Date of Completion'; break;
        case 'length': readableParam = 'Course Length'; break;
        case 'course': readableParam = 'Course Name'; break;
        case 'teacher': readableParam = 'Instructor Name'; break;
    }
    message += `<li>${readableParam}</li>`;
  });
  message += "</ul><p>Please ensure all details are sent correctly from the previous page.</p>";
  message += `<p><a href="javascript:history.back()" class="error-back-link">Go Back and Retry</a></p>`;


  if (container) {
    container.innerHTML = `<div class="udemy-error-container">${message}</div>`;
    const errorContainerStyle = document.querySelector('.udemy-error-container');
    if (errorContainerStyle) {
        // Styles moved to udemy.css
    }
  } else {
    alert("Error: Missing required URL parameters to generate the certificate.\nMissing: " + missingParams.join(', '));
  }
}


// --- Function to Parse URL Parameters and Display Certificate or Error ---
function processURLParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  const dataFromParams = {};
  const missingParams = [];
  // These are the keys your React app should send
  const requiredParams = ['fname', 'lname', 'date', 'length', 'course', 'teacher'];

  requiredParams.forEach(param => {
    const value = urlParams.get(param);
    if (value && value.trim() !== "") { // Also check if value is not just whitespace
      dataFromParams[param] = decodeURIComponent(value.replace(/\+/g, ' '));
    } else {
      missingParams.push(param);
    }
  });

  if (missingParams.length === 0) {
    console.log("All required parameters found in URL. Displaying certificate directly.", dataFromParams);
    displayCertificate(dataFromParams);
  } else {
    console.error("Missing or empty required URL parameters:", missingParams);
    displayParameterError(missingParams);
  }
}

// --- Event Listener for Download Button ---
if (downloadButton) {
  downloadButton.addEventListener("click", () => {
    if (!certificateDiv || !certificateDiv.innerHTML.trim()) {
      alert("Certificate data not found. Cannot download.");
      return;
    }
    let certFirstName = 'Certificate';
    let certLastName = 'User';
    const nameElement = certificateDiv.querySelector('#name'); // Target #name within #certificate
    if (nameElement && nameElement.textContent) {
        const nameParts = nameElement.textContent.trim().split(/\s+/); // Split by any whitespace
        certFirstName = nameParts[0] || certFirstName;
        certLastName = nameParts.slice(1).join(' ') || certLastName;
    }

    var opt = {
      margin: 0,
      filename: `Udemy-Certificate-${certFirstName}-${certLastName}.pdf`, // Standardized filename
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, scrollX: 0, scrollY: -window.scrollY, logging: false, width: 1280, height: 900, windowWidth: 1280, windowHeight: 900 },
      jsPDF: { unit: "px", format: [1280, 900], orientation: "landscape" },
    };

    html2pdf().set(opt).from(certificateDiv).save()
        .catch(err => console.error("Error during PDF generation:", err));
  });
}

// --- Run parameter processing on page load ---
window.addEventListener('DOMContentLoaded', processURLParameters);